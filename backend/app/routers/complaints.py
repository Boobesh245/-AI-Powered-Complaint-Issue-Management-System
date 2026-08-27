import os
from fastapi import APIRouter, HTTPException, Depends, Query, UploadFile, File, Form
from typing import Optional, List
from datetime import datetime, timezone
from bson import ObjectId
from app.database import get_database
from app.schemas.complaint import (
    ComplaintCreate, ComplaintUpdate, ComplaintStatusUpdate, ComplaintPriorityUpdate,
    ComplaintAssignUpdate, ComplaintBulkAssign, ComplaintBulkStatus, CommentCreate
)
from app.services.complaint_service import complaint_service
from app.services.audit_service import audit_service
from app.services.notification_service import notification_service
from app.utils.helpers import serialize_mongo, evaluate_sla_status
from app.middleware.auth import get_current_user, require_admin, require_staff_or_admin

router = APIRouter(prefix="/complaints", tags=["Complaints"])

@router.get("")
def list_complaints(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    status: Optional[str] = None,
    priority: Optional[str] = None,
    category_id: Optional[str] = None,
    department_id: Optional[str] = None,
    staff_id: Optional[str] = None,
    sla_status: Optional[str] = None,
    sort_by: Optional[str] = "created_at",
    sort_order: Optional[str] = "desc",
    current_user: dict = Depends(get_current_user)
):
    db = get_database()
    query = {}

    # Role-based scoping
    user_role = current_user.get("role", "user")
    if user_role == "user":
        query["user_id"] = current_user["id"]
    elif user_role == "staff":
        # Find staff document
        staff_rec = db.staff.find_one({"user_id": current_user["id"]})
        if staff_rec:
            query["assigned_staff_id"] = str(staff_rec["_id"])

    # Filters
    if status and status != "all":
        query["status"] = status
    if priority and priority != "all":
        query["priority"] = priority
    if category_id and category_id != "all":
        query["category_id"] = category_id
    if department_id and department_id != "all":
        query["department_id"] = department_id
    if staff_id and staff_id != "all":
        query["assigned_staff_id"] = staff_id
    if sla_status and sla_status != "all":
        query["sla_status"] = sla_status

    if search:
        query["$or"] = [
            {"complaint_number": {"$regex": search, "$options": "i"}},
            {"title": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}},
            {"user_name": {"$regex": search, "$options": "i"}},
            {"category_name": {"$regex": search, "$options": "i"}},
            {"department_name": {"$regex": search, "$options": "i"}}
        ]

    sort_direction = -1 if sort_order == "desc" else 1
    total = db.complaints.count_documents(query)
    skip = (page - 1) * limit
    complaints = list(db.complaints.find(query).sort(sort_by, sort_direction).skip(skip).limit(limit))

    # Add real-time SLA refresh
    for c in complaints:
        c["sla_status"] = evaluate_sla_status(
            c.get("created_at", datetime.now(timezone.utc)),
            c.get("due_date"),
            c.get("status", "submitted"),
            c.get("resolved_at")
        )

    return {
        "success": True,
        "items": serialize_mongo(complaints),
        "page": page,
        "limit": limit,
        "total": total,
        "pages": (total + limit - 1) // limit if limit else 1
    }

@router.get("/{complaint_id}")
def get_complaint(complaint_id: str, current_user: dict = Depends(get_current_user)):
    db = get_database()
    comp = db.complaints.find_one({"_id": ObjectId(complaint_id)}) if ObjectId.is_valid(complaint_id) else db.complaints.find_one({"_id": complaint_id})
    if not comp:
        raise HTTPException(status_code=404, detail="Complaint not found")

    # Ownership / authorization check
    user_role = current_user.get("role", "user")
    if user_role == "user" and comp["user_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="Access denied to this complaint")

    # Fetch comments
    comments = list(db.comments.find({"complaint_id": str(comp["_id"])}).sort("created_at", 1))
    
    # Fetch feedback if any
    feedback = db.feedback.find_one({"complaint_id": str(comp["_id"])})

    # Update real-time SLA status
    comp["sla_status"] = evaluate_sla_status(
        comp.get("created_at", datetime.now(timezone.utc)),
        comp.get("due_date"),
        comp.get("status", "submitted"),
        comp.get("resolved_at")
    )

    res = serialize_mongo(comp)
    res["comments"] = serialize_mongo(comments)
    res["feedback"] = serialize_mongo(feedback) if feedback else None
    return {"success": True, "data": res}

@router.post("", status_code=201)
def create_complaint(req: ComplaintCreate, current_user: dict = Depends(get_current_user)):
    created = complaint_service.create_complaint(
        user=current_user,
        title=req.title,
        description=req.description,
        category_id=req.category_id,
        department_id=req.department_id,
        priority=req.priority,
        location=req.location,
        attachments=req.attachments
    )
    return {"success": True, "message": "Complaint submitted successfully", "data": created}

@router.put("/{complaint_id}")
def update_complaint(complaint_id: str, req: ComplaintUpdate, current_user: dict = Depends(get_current_user)):
    db = get_database()
    comp = db.complaints.find_one({"_id": ObjectId(complaint_id)}) if ObjectId.is_valid(complaint_id) else db.complaints.find_one({"_id": complaint_id})
    if not comp:
        raise HTTPException(status_code=404, detail="Complaint not found")

    if current_user["role"] == "user" and comp["user_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="Access denied")

    update_dict = {k: v for k, v in req.model_dump().items() if v is not None}
    update_dict["updated_at"] = datetime.now(timezone.utc)

    db.complaints.update_one({"_id": comp["_id"]}, {"$set": update_dict})

    audit_service.log(
        user_id=current_user["id"],
        user_email=current_user.get("email", ""),
        action="UPDATE_COMPLAINT",
        entity="complaint",
        entity_id=complaint_id,
        new_value=update_dict
    )

    updated_doc = db.complaints.find_one({"_id": comp["_id"]})
    return {"success": True, "data": serialize_mongo(updated_doc)}

@router.patch("/{complaint_id}/status")
def change_status(complaint_id: str, req: ComplaintStatusUpdate, current_user: dict = Depends(require_staff_or_admin)):
    try:
        updated = complaint_service.update_status(complaint_id, req.status, current_user, req.comment)
        return {"success": True, "message": f"Status updated to '{req.status}'", "data": updated}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.patch("/{complaint_id}/priority")
def change_priority(complaint_id: str, req: ComplaintPriorityUpdate, current_user: dict = Depends(require_admin)):
    db = get_database()
    comp = db.complaints.find_one({"_id": ObjectId(complaint_id)}) if ObjectId.is_valid(complaint_id) else db.complaints.find_one({"_id": complaint_id})
    if not comp:
        raise HTTPException(status_code=404, detail="Complaint not found")

    now = datetime.now(timezone.utc)
    old_p = comp.get("priority")
    
    timeline_entry = {
        "action": f"Priority changed from {old_p.upper()} to {req.priority.upper()}",
        "timestamp": now,
        "actor": current_user.get("name", "Admin"),
        "details": req.comment or f"Priority adjusted to '{req.priority}'."
    }

    db.complaints.update_one(
        {"_id": comp["_id"]},
        {
            "$set": {"priority": req.priority.lower(), "updated_at": now},
            "$push": {"activity_timeline": timeline_entry}
        }
    )

    audit_service.log(
        user_id=current_user["id"],
        user_email=current_user.get("email", ""),
        action="CHANGE_PRIORITY",
        entity="complaint",
        entity_id=complaint_id,
        old_value=old_p,
        new_value=req.priority
    )

    updated_doc = db.complaints.find_one({"_id": comp["_id"]})
    return {"success": True, "data": serialize_mongo(updated_doc)}

@router.patch("/{complaint_id}/assign")
def assign_staff(complaint_id: str, req: ComplaintAssignUpdate, current_user: dict = Depends(require_admin)):
    try:
        updated = complaint_service.assign_staff(complaint_id, req.assigned_staff_id, current_user, req.comment)
        return {"success": True, "message": "Staff member assigned successfully", "data": updated}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{complaint_id}/comments")
def add_comment(complaint_id: str, req: CommentCreate, current_user: dict = Depends(get_current_user)):
    db = get_database()
    comp = db.complaints.find_one({"_id": ObjectId(complaint_id)}) if ObjectId.is_valid(complaint_id) else db.complaints.find_one({"_id": complaint_id})
    if not comp:
        raise HTTPException(status_code=404, detail="Complaint not found")

    now = datetime.now(timezone.utc)
    comment_doc = {
        "complaint_id": str(comp["_id"]),
        "user_id": current_user["id"],
        "user_name": current_user.get("name", "User"),
        "user_role": current_user.get("role", "user"),
        "message": req.message,
        "attachments": req.attachments or [],
        "created_at": now,
        "updated_at": now
    }

    insert_res = db.comments.insert_one(comment_doc)
    comment_id = str(insert_res.inserted_id)
    comment_doc["id"] = comment_id

    # Update timeline
    timeline_entry = {
        "action": "New Comment Added",
        "timestamp": now,
        "actor": current_user.get("name", "User"),
        "details": req.message[:60] + ("..." if len(req.message) > 60 else "")
    }
    db.complaints.update_one({"_id": comp["_id"]}, {"$push": {"activity_timeline": timeline_entry}})

    # Notify counterpart (if user commented, notify staff/admin; if staff/admin commented, notify user)
    if current_user["id"] == comp["user_id"]:
        if comp.get("assigned_staff_id"):
            staff_rec = db.staff.find_one({"_id": ObjectId(comp["assigned_staff_id"])}) if ObjectId.is_valid(comp["assigned_staff_id"]) else db.staff.find_one({"_id": comp["assigned_staff_id"]})
            if staff_rec:
                notification_service.create_notification(
                    user_id=str(staff_rec["user_id"]),
                    title=f"New comment on #{comp['complaint_number']}",
                    message=f"{current_user.get('name')}: {req.message[:50]}",
                    notif_type="new_comment",
                    reference_id=complaint_id
                )
    else:
        notification_service.create_notification(
            user_id=comp["user_id"],
            title=f"Staff commented on #{comp['complaint_number']}",
            message=f"{current_user.get('name')}: {req.message[:50]}",
            notif_type="new_comment",
            reference_id=complaint_id
        )

    return {"success": True, "data": serialize_mongo(comment_doc)}

@router.post("/{complaint_id}/resolve")
def resolve_complaint(complaint_id: str, current_user: dict = Depends(require_staff_or_admin)):
    updated = complaint_service.update_status(complaint_id, "resolved", current_user, "Complaint marked as resolved.")
    return {"success": True, "message": "Complaint resolved", "data": updated}

@router.post("/{complaint_id}/reopen")
def reopen_complaint(complaint_id: str, current_user: dict = Depends(get_current_user)):
    updated = complaint_service.update_status(complaint_id, "reopened", current_user, "Complaint reopened by user.")
    return {"success": True, "message": "Complaint reopened", "data": updated}

@router.post("/{complaint_id}/close")
def close_complaint(complaint_id: str, current_user: dict = Depends(require_admin)):
    updated = complaint_service.update_status(complaint_id, "closed", current_user, "Complaint closed.")
    return {"success": True, "message": "Complaint closed", "data": updated}

@router.post("/bulk/assign")
def bulk_assign(req: ComplaintBulkAssign, current_user: dict = Depends(require_admin)):
    results = []
    for cid in req.complaint_ids:
        try:
            complaint_service.assign_staff(cid, req.assigned_staff_id, current_user)
            results.append(cid)
        except Exception:
            pass
    return {"success": True, "message": f"{len(results)} complaints assigned successfully"}

@router.post("/bulk/status")
def bulk_status(req: ComplaintBulkStatus, current_user: dict = Depends(require_admin)):
    results = []
    for cid in req.complaint_ids:
        try:
            complaint_service.update_status(cid, req.status, current_user)
            results.append(cid)
        except Exception:
            pass
    return {"success": True, "message": f"{len(results)} complaints updated to '{req.status}'"}

@router.delete("/{complaint_id}")
def delete_complaint(complaint_id: str, current_user: dict = Depends(require_admin)):
    db = get_database()
    db.complaints.delete_one({"_id": ObjectId(complaint_id)}) if ObjectId.is_valid(complaint_id) else db.complaints.delete_one({"_id": complaint_id})
    db.comments.delete_many({"complaint_id": complaint_id})
    db.feedback.delete_many({"complaint_id": complaint_id})

    audit_service.log(
        user_id=current_user["id"],
        user_email=current_user.get("email", ""),
        action="DELETE_COMPLAINT",
        entity="complaint",
        entity_id=complaint_id
    )

    return {"success": True, "message": "Complaint deleted successfully"}

@router.post("/upload")
async def upload_attachment(file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    upload_dir = "uploads"
    os.makedirs(upload_dir, exist_ok=True)
    
    file_ext = file.filename.split(".")[-1].lower() if "." in file.filename else "dat"
    clean_name = f"{int(datetime.now().timestamp())}_{file.filename.replace(' ', '_')}"
    file_path = os.path.join(upload_dir, clean_name)
    
    content = await file.read()
    with open(file_path, "wb") as f:
        f.write(content)
        
    return {
        "success": True,
        "data": {
            "filename": file.filename,
            "file_path": f"/uploads/{clean_name}",
            "file_type": file.content_type or file_ext,
            "file_size": len(content),
            "uploaded_at": datetime.now(timezone.utc).isoformat()
        }
    }

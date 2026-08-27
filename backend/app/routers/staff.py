# pyrefly: ignore [missing-import]
from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime, timezone
from bson import ObjectId
from app.database import get_database
from app.schemas.staff import StaffCreate, StaffUpdate
from app.utils.security import get_password_hash
from app.utils.helpers import serialize_mongo
from app.middleware.auth import require_admin, get_current_user
from app.services.audit_service import audit_service

router = APIRouter(prefix="/staff", tags=["Staff"])

@router.get("")
def list_staff(current_user: dict = Depends(get_current_user)):
    db = get_database()
    staff_list = list(db.staff.find().sort("created_at", -1))
    enriched = []
    for s in staff_list:
        staff_id = str(s["_id"])
        user = db.users.find_one({"_id": ObjectId(s["user_id"])}) if ObjectId.is_valid(s["user_id"]) else db.users.find_one({"_id": s["user_id"]})
        dept = db.departments.find_one({"_id": ObjectId(s["department_id"])}) if ObjectId.is_valid(s.get("department_id")) else db.departments.find_one({"_id": s.get("department_id")})
        
        assigned_count = db.complaints.count_documents({"assigned_staff_id": staff_id})
        resolved_count = db.complaints.count_documents({"assigned_staff_id": staff_id, "status": {"$in": ["resolved", "closed"]}})
        
        doc = serialize_mongo(s)
        doc["name"] = user.get("name", "Staff Member") if user else "Staff Member"
        doc["email"] = user.get("email", "") if user else ""
        doc["phone"] = user.get("phone", "") if user else ""
        doc["department_name"] = dept.get("name", "General") if dept else "General"
        doc["current_workload"] = assigned_count - resolved_count
        doc["resolved_complaints"] = resolved_count
        doc["customer_rating"] = 4.6
        doc["avg_resolution_hours"] = 18.0
        enriched.append(doc)
        
    return {"success": True, "items": enriched}

@router.get("/{staff_id}")
def get_staff_member(staff_id: str, current_user: dict = Depends(get_current_user)):
    db = get_database()
    s = db.staff.find_one({"_id": ObjectId(staff_id)}) if ObjectId.is_valid(staff_id) else db.staff.find_one({"_id": staff_id})
    if not s:
        raise HTTPException(status_code=404, detail="Staff member not found")

    user = db.users.find_one({"_id": ObjectId(s["user_id"])}) if ObjectId.is_valid(s["user_id"]) else db.users.find_one({"_id": s["user_id"]})
    dept = db.departments.find_one({"_id": ObjectId(s["department_id"])}) if ObjectId.is_valid(s.get("department_id")) else db.departments.find_one({"_id": s.get("department_id")})

    doc = serialize_mongo(s)
    doc["name"] = user.get("name", "Staff Member") if user else "Staff Member"
    doc["email"] = user.get("email", "") if user else ""
    doc["phone"] = user.get("phone", "") if user else ""
    doc["department_name"] = dept.get("name", "General") if dept else "General"
    return {"success": True, "data": doc}

@router.post("")
def create_staff(req: StaffCreate, current_user: dict = Depends(require_admin)):
    db = get_database()
    existing = db.users.find_one({"email": req.email.lower()})
    if existing:
        raise HTTPException(status_code=400, detail="User email already exists")

    now = datetime.now(timezone.utc)
    user_doc = {
        "name": req.name,
        "email": req.email.lower(),
        "password_hash": get_password_hash(req.password),
        "phone": req.phone,
        "role": "staff",
        "department_id": req.department_id,
        "status": "active",
        "is_verified": True,
        "created_at": now,
        "updated_at": now
    }
    user_res = db.users.insert_one(user_doc)
    user_id = str(user_res.inserted_id)

    staff_doc = {
        "user_id": user_id,
        "employee_id": req.employee_id,
        "department_id": req.department_id,
        "designation": req.designation,
        "specialization": req.specialization,
        "availability": True,
        "current_workload": 0,
        "resolved_complaints": 0,
        "status": "active",
        "created_at": now
    }
    staff_res = db.staff.insert_one(staff_doc)
    staff_id = str(staff_res.inserted_id)

    audit_service.log(
        user_id=current_user["id"],
        user_email=current_user.get("email", ""),
        action="CREATE_STAFF",
        entity="staff",
        entity_id=staff_id
    )

    staff_doc["id"] = staff_id
    staff_doc["name"] = req.name
    staff_doc["email"] = req.email
    return {"success": True, "data": serialize_mongo(staff_doc)}

@router.put("/{staff_id}")
def update_staff(staff_id: str, req: StaffUpdate, current_user: dict = Depends(require_admin)):
    db = get_database()
    s = db.staff.find_one({"_id": ObjectId(staff_id)}) if ObjectId.is_valid(staff_id) else db.staff.find_one({"_id": staff_id})
    if not s:
        raise HTTPException(status_code=404, detail="Staff not found")

    update_data = {k: v for k, v in req.model_dump().items() if v is not None}
    db.staff.update_one({"_id": s["_id"]}, {"$set": update_data})

    audit_service.log(
        user_id=current_user["id"],
        user_email=current_user.get("email", ""),
        action="UPDATE_STAFF",
        entity="staff",
        entity_id=staff_id,
        new_value=update_data
    )

    updated = db.staff.find_one({"_id": s["_id"]})
    return {"success": True, "data": serialize_mongo(updated)}

@router.delete("/{staff_id}")
def delete_staff(staff_id: str, current_user: dict = Depends(require_admin)):
    db = get_database()
    s = db.staff.find_one({"_id": ObjectId(staff_id)}) if ObjectId.is_valid(staff_id) else db.staff.find_one({"_id": staff_id})
    if not s:
        raise HTTPException(status_code=404, detail="Staff not found")

    db.staff.delete_one({"_id": s["_id"]})
    db.users.delete_one({"_id": ObjectId(s["user_id"])}) if ObjectId.is_valid(s["user_id"]) else db.users.delete_one({"_id": s["user_id"]})

    audit_service.log(
        user_id=current_user["id"],
        user_email=current_user.get("email", ""),
        action="DELETE_STAFF",
        entity="staff",
        entity_id=staff_id
    )

    return {"success": True, "message": "Staff member deleted"}

@router.get("/{staff_id}/complaints")
def get_staff_complaints(staff_id: str, current_user: dict = Depends(get_current_user)):
    db = get_database()
    comps = list(db.complaints.find({"assigned_staff_id": staff_id}).sort("created_at", -1))
    return {"success": True, "items": serialize_mongo(comps)}

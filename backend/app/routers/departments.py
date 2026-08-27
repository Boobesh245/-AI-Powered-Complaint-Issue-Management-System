from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime, timezone
from bson import ObjectId
from app.database import get_database
from app.schemas.department import DepartmentCreate, DepartmentUpdate
from app.utils.helpers import serialize_mongo
from app.middleware.auth import require_admin, get_current_user
from app.services.audit_service import audit_service

router = APIRouter(prefix="/departments", tags=["Departments"])

@router.get("")
def list_departments(current_user: dict = Depends(get_current_user)):
    db = get_database()
    departments = list(db.departments.find().sort("name", 1))
    enriched = []
    for d in departments:
        dept_id = str(d["_id"])
        staff_count = db.staff.count_documents({"department_id": dept_id})
        complaints_count = db.complaints.count_documents({"department_id": dept_id})
        resolved_count = db.complaints.count_documents({"department_id": dept_id, "status": {"$in": ["resolved", "closed"]}})
        res_rate = round((resolved_count / complaints_count * 100), 1) if complaints_count > 0 else 0.0

        head_name = "None"
        if d.get("head_id"):
            head_user = db.users.find_one({"_id": ObjectId(d["head_id"])}) if ObjectId.is_valid(d["head_id"]) else db.users.find_one({"_id": d["head_id"]})
            if head_user:
                head_name = head_user.get("name", "None")

        doc = serialize_mongo(d)
        doc["staff_count"] = staff_count
        doc["complaints_count"] = complaints_count
        doc["resolved_count"] = resolved_count
        doc["resolution_rate"] = res_rate
        doc["head_name"] = head_name
        enriched.append(doc)
    return {"success": True, "items": enriched}

@router.get("/{dept_id}")
def get_department(dept_id: str, current_user: dict = Depends(get_current_user)):
    db = get_database()
    dept = db.departments.find_one({"_id": ObjectId(dept_id)}) if ObjectId.is_valid(dept_id) else db.departments.find_one({"_id": dept_id})
    if not dept:
        raise HTTPException(status_code=404, detail="Department not found")
    return {"success": True, "data": serialize_mongo(dept)}

@router.post("")
def create_department(req: DepartmentCreate, current_user: dict = Depends(require_admin)):
    db = get_database()
    existing = db.departments.find_one({"$or": [{"name": req.name}, {"code": req.code}]})
    if existing:
        raise HTTPException(status_code=400, detail="Department name or code already exists")

    now = datetime.now(timezone.utc)
    doc = req.model_dump()
    doc["created_at"] = now
    doc["updated_at"] = now
    res = db.departments.insert_one(doc)
    doc["id"] = str(res.inserted_id)

    audit_service.log(
        user_id=current_user["id"],
        user_email=current_user.get("email", ""),
        action="CREATE_DEPARTMENT",
        entity="department",
        entity_id=doc["id"]
    )

    return {"success": True, "data": serialize_mongo(doc)}

@router.put("/{dept_id}")
def update_department(dept_id: str, req: DepartmentUpdate, current_user: dict = Depends(require_admin)):
    db = get_database()
    dept = db.departments.find_one({"_id": ObjectId(dept_id)}) if ObjectId.is_valid(dept_id) else db.departments.find_one({"_id": dept_id})
    if not dept:
        raise HTTPException(status_code=404, detail="Department not found")

    update_data = {k: v for k, v in req.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc)
    db.departments.update_one({"_id": dept["_id"]}, {"$set": update_data})

    audit_service.log(
        user_id=current_user["id"],
        user_email=current_user.get("email", ""),
        action="UPDATE_DEPARTMENT",
        entity="department",
        entity_id=dept_id,
        new_value=update_data
    )

    updated = db.departments.find_one({"_id": dept["_id"]})
    return {"success": True, "data": serialize_mongo(updated)}

@router.delete("/{dept_id}")
def delete_department(dept_id: str, current_user: dict = Depends(require_admin)):
    db = get_database()
    db.departments.delete_one({"_id": ObjectId(dept_id)}) if ObjectId.is_valid(dept_id) else db.departments.delete_one({"_id": dept_id})
    
    audit_service.log(
        user_id=current_user["id"],
        user_email=current_user.get("email", ""),
        action="DELETE_DEPARTMENT",
        entity="department",
        entity_id=dept_id
    )

    return {"success": True, "message": "Department deleted successfully"}

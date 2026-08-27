from fastapi import APIRouter, HTTPException, Depends, Query
from typing import Optional
from datetime import datetime, timezone
from bson import ObjectId
from app.database import get_database
from app.schemas.user import UserCreate, UserUpdate, UserStatusUpdate
from app.utils.security import get_password_hash
from app.utils.helpers import serialize_mongo
from app.middleware.auth import require_admin, get_current_user
from app.services.audit_service import audit_service

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("")
def list_users(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    role: Optional[str] = None,
    status: Optional[str] = None,
    current_user: dict = Depends(require_admin)
):
    db = get_database()
    query = {}
    if role and role != "all":
        query["role"] = role
    if status and status != "all":
        query["status"] = status
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"email": {"$regex": search, "$options": "i"}},
            {"phone": {"$regex": search, "$options": "i"}}
        ]

    total = db.users.count_documents(query)
    skip = (page - 1) * limit
    users = list(db.users.find(query).sort("created_at", -1).skip(skip).limit(limit))

    # Enrich users with complaints count
    enriched = []
    for u in users:
        u_id = str(u["_id"])
        c_count = db.complaints.count_documents({"user_id": u_id})
        doc = serialize_mongo(u)
        doc["complaints_count"] = c_count
        enriched.append(doc)

    return {
        "success": True,
        "items": enriched,
        "page": page,
        "limit": limit,
        "total": total,
        "pages": (total + limit - 1) // limit if limit else 1
    }

@router.get("/{user_id}")
def get_user_by_id(user_id: str, current_user: dict = Depends(get_current_user)):
    db = get_database()
    if current_user["role"] not in ["admin", "super_admin"] and current_user["id"] != user_id:
        raise HTTPException(status_code=403, detail="Access denied")

    user = db.users.find_one({"_id": ObjectId(user_id)}) if ObjectId.is_valid(user_id) else db.users.find_one({"_id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    res = serialize_mongo(user)
    res["complaints_count"] = db.complaints.count_documents({"user_id": user_id})
    return {"success": True, "data": res}

@router.post("")
def create_user(req: UserCreate, current_user: dict = Depends(require_admin)):
    db = get_database()
    existing = db.users.find_one({"email": req.email.lower()})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    now = datetime.now(timezone.utc)
    user_doc = {
        "name": req.name,
        "email": req.email.lower(),
        "password_hash": get_password_hash(req.password),
        "phone": req.phone,
        "role": req.role,
        "department_id": req.department_id,
        "status": req.status,
        "is_verified": True,
        "created_at": now,
        "updated_at": now,
        "last_login": None
    }
    insert_res = db.users.insert_one(user_doc)
    user_id = str(insert_res.inserted_id)

    audit_service.log(
        user_id=current_user["id"],
        user_email=current_user.get("email", ""),
        action="CREATE_USER",
        entity="user",
        entity_id=user_id
    )

    return {"success": True, "data": serialize_mongo(user_doc)}

@router.put("/{user_id}")
def update_user(user_id: str, req: UserUpdate, current_user: dict = Depends(get_current_user)):
    db = get_database()
    if current_user["role"] not in ["admin", "super_admin"] and current_user["id"] != user_id:
        raise HTTPException(status_code=403, detail="Access denied")

    target = db.users.find_one({"_id": ObjectId(user_id)}) if ObjectId.is_valid(user_id) else db.users.find_one({"_id": user_id})
    if not target:
        raise HTTPException(status_code=404, detail="User not found")

    update_data = {k: v for k, v in req.model_dump().items() if v is not None}
    
    # Non-admins cannot elevate their own role
    if current_user["role"] not in ["admin", "super_admin"]:
        update_data.pop("role", None)
        update_data.pop("status", None)

    update_data["updated_at"] = datetime.now(timezone.utc)
    db.users.update_one({"_id": target["_id"]}, {"$set": update_data})

    audit_service.log(
        user_id=current_user["id"],
        user_email=current_user.get("email", ""),
        action="UPDATE_USER",
        entity="user",
        entity_id=user_id,
        new_value=update_data
    )

    updated_user = db.users.find_one({"_id": target["_id"]})
    return {"success": True, "data": serialize_mongo(updated_user)}

@router.patch("/{user_id}/status")
def change_user_status(user_id: str, req: UserStatusUpdate, current_user: dict = Depends(require_admin)):
    db = get_database()
    target = db.users.find_one({"_id": ObjectId(user_id)}) if ObjectId.is_valid(user_id) else db.users.find_one({"_id": user_id})
    if not target:
        raise HTTPException(status_code=404, detail="User not found")

    db.users.update_one({"_id": target["_id"]}, {"$set": {"status": req.status, "updated_at": datetime.now(timezone.utc)}})

    audit_service.log(
        user_id=current_user["id"],
        user_email=current_user.get("email", ""),
        action="UPDATE_USER_STATUS",
        entity="user",
        entity_id=user_id,
        old_value=target.get("status"),
        new_value=req.status
    )

    return {"success": True, "message": f"User status changed to {req.status}"}

@router.delete("/{user_id}")
def delete_user(user_id: str, current_user: dict = Depends(require_admin)):
    db = get_database()
    if user_id == current_user["id"]:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")

    db.users.delete_one({"_id": ObjectId(user_id)}) if ObjectId.is_valid(user_id) else db.users.delete_one({"_id": user_id})
    
    audit_service.log(
        user_id=current_user["id"],
        user_email=current_user.get("email", ""),
        action="DELETE_USER",
        entity="user",
        entity_id=user_id
    )

    return {"success": True, "message": "User deleted successfully"}

@router.get("/{user_id}/complaints")
def get_user_complaints(user_id: str, current_user: dict = Depends(get_current_user)):
    if current_user["role"] not in ["admin", "super_admin"] and current_user["id"] != user_id:
        raise HTTPException(status_code=403, detail="Access denied")

    db = get_database()
    complaints = list(db.complaints.find({"user_id": user_id}).sort("created_at", -1))
    return {"success": True, "items": serialize_mongo(complaints)}

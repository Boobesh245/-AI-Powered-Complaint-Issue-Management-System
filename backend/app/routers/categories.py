from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime, timezone
from bson import ObjectId
from app.database import get_database
from app.schemas.category import CategoryCreate, CategoryUpdate
from app.utils.helpers import serialize_mongo
from app.middleware.auth import require_admin, get_current_user
from app.services.audit_service import audit_service

router = APIRouter(prefix="/categories", tags=["Categories"])

@router.get("")
def list_categories(current_user: dict = Depends(get_current_user)):
    db = get_database()
    cats = list(db.categories.find().sort("name", 1))
    enriched = []
    for c in cats:
        c_id = str(c["_id"])
        c_count = db.complaints.count_documents({"category_id": c_id})
        dept_name = "General"
        if c.get("department_id"):
            d = db.departments.find_one({"_id": ObjectId(c["department_id"])}) if ObjectId.is_valid(c["department_id"]) else db.departments.find_one({"_id": c["department_id"]})
            if d:
                dept_name = d.get("name", "General")

        doc = serialize_mongo(c)
        doc["complaints_count"] = c_count
        doc["department_name"] = dept_name
        enriched.append(doc)
    return {"success": True, "items": enriched}

@router.post("")
def create_category(req: CategoryCreate, current_user: dict = Depends(require_admin)):
    db = get_database()
    existing = db.categories.find_one({"name": req.name})
    if existing:
        raise HTTPException(status_code=400, detail="Category name already exists")

    now = datetime.now(timezone.utc)
    doc = req.model_dump()
    doc["created_at"] = now
    doc["updated_at"] = now
    res = db.categories.insert_one(doc)
    doc["id"] = str(res.inserted_id)

    audit_service.log(
        user_id=current_user["id"],
        user_email=current_user.get("email", ""),
        action="CREATE_CATEGORY",
        entity="category",
        entity_id=doc["id"]
    )

    return {"success": True, "data": serialize_mongo(doc)}

@router.put("/{cat_id}")
def update_category(cat_id: str, req: CategoryUpdate, current_user: dict = Depends(require_admin)):
    db = get_database()
    cat = db.categories.find_one({"_id": ObjectId(cat_id)}) if ObjectId.is_valid(cat_id) else db.categories.find_one({"_id": cat_id})
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")

    update_data = {k: v for k, v in req.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc)
    db.categories.update_one({"_id": cat["_id"]}, {"$set": update_data})

    audit_service.log(
        user_id=current_user["id"],
        user_email=current_user.get("email", ""),
        action="UPDATE_CATEGORY",
        entity="category",
        entity_id=cat_id,
        new_value=update_data
    )

    updated = db.categories.find_one({"_id": cat["_id"]})
    return {"success": True, "data": serialize_mongo(updated)}

@router.delete("/{cat_id}")
def delete_category(cat_id: str, current_user: dict = Depends(require_admin)):
    db = get_database()
    db.categories.delete_one({"_id": ObjectId(cat_id)}) if ObjectId.is_valid(cat_id) else db.categories.delete_one({"_id": cat_id})
    
    audit_service.log(
        user_id=current_user["id"],
        user_email=current_user.get("email", ""),
        action="DELETE_CATEGORY",
        entity="category",
        entity_id=cat_id
    )

    return {"success": True, "message": "Category deleted successfully"}

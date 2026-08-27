from fastapi import APIRouter, Depends
from datetime import datetime, timezone
from app.database import get_database
from app.schemas.settings import SystemSettingsSchema
from app.utils.helpers import serialize_mongo
from app.middleware.auth import require_admin
from app.services.audit_service import audit_service

router = APIRouter(prefix="/settings", tags=["Settings"])

DEFAULT_SETTINGS = {
    "app_name": "AI-Powered Complaint & Issue Management System",
    "default_priority": "medium",
    "default_status": "submitted",
    "max_file_size_mb": 10,
    "allowed_file_types": ["jpg", "jpeg", "png", "pdf", "doc", "docx"],
    "enable_ai_classification": True,
    "ai_duplicate_threshold": 0.75,
    "email_notifications_enabled": False,
    "maintenance_mode": False,
    "sla_critical_hours": 24,
    "sla_high_hours": 48,
    "sla_medium_hours": 72,
    "sla_low_hours": 120
}

@router.get("")
def get_settings(current_user: dict = Depends(require_admin)):
    db = get_database()
    settings_doc = db.system_settings.find_one({"key": "main_config"})
    if not settings_doc:
        settings_doc = {**DEFAULT_SETTINGS, "key": "main_config", "updated_at": datetime.now(timezone.utc)}
        db.system_settings.insert_one(settings_doc)
    return {"success": True, "data": serialize_mongo(settings_doc)}

@router.put("")
def update_settings(req: SystemSettingsSchema, current_user: dict = Depends(require_admin)):
    db = get_database()
    now = datetime.now(timezone.utc)
    new_vals = req.model_dump()
    new_vals["updated_at"] = now

    db.system_settings.update_one(
        {"key": "main_config"},
        {"$set": new_vals},
        upsert=True
    )

    audit_service.log(
        user_id=current_user["id"],
        user_email=current_user.get("email", ""),
        action="UPDATE_SYSTEM_SETTINGS",
        entity="system_settings",
        entity_id="main_config",
        new_value=new_vals
    )

    return {"success": True, "message": "Settings updated successfully", "data": new_vals}

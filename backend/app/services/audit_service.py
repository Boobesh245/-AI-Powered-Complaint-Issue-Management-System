from datetime import datetime, timezone
from typing import Optional, Any
from app.database import get_database

class AuditService:
    @staticmethod
    def log(
        user_id: str,
        user_email: str,
        action: str,
        entity: str,
        entity_id: str,
        old_value: Optional[Any] = None,
        new_value: Optional[Any] = None,
        ip_address: Optional[str] = "127.0.0.1"
    ):
        try:
            db = get_database()
            audit_entry = {
                "user_id": user_id,
                "user_email": user_email,
                "action": action,
                "entity": entity,
                "entity_id": str(entity_id),
                "old_value": old_value,
                "new_value": new_value,
                "ip_address": ip_address,
                "timestamp": datetime.now(timezone.utc)
            }
            db.audit_logs.insert_one(audit_entry)
        except Exception as e:
            # Audit failures must not break user request
            print(f"Audit log failed: {e}")

audit_service = AuditService()

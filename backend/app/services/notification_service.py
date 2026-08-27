from datetime import datetime, timezone
from typing import Optional
from bson import ObjectId
from app.database import get_database

class NotificationService:
    @staticmethod
    def create_notification(
        user_id: str,
        title: str,
        message: str,
        notif_type: str,
        reference_id: Optional[str] = None
    ):
        try:
            db = get_database()
            notif = {
                "user_id": str(user_id),
                "title": title,
                "message": message,
                "type": notif_type,
                "reference_id": str(reference_id) if reference_id else None,
                "is_read": False,
                "created_at": datetime.now(timezone.utc)
            }
            db.notifications.insert_one(notif)
            return notif
        except Exception as e:
            print(f"Failed to create notification: {e}")
            return None

    @staticmethod
    def notify_admins(title: str, message: str, notif_type: str, reference_id: Optional[str] = None):
        try:
            db = get_database()
            admins = list(db.users.find({"role": {"$in": ["super_admin", "admin"]}}, {"_id": 1}))
            for admin in admins:
                NotificationService.create_notification(
                    user_id=str(admin["_id"]),
                    title=title,
                    message=message,
                    notif_type=notif_type,
                    reference_id=reference_id
                )
        except Exception as e:
            print(f"Failed to notify admins: {e}")

notification_service = NotificationService()

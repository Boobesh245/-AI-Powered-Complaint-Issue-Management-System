from fastapi import APIRouter, HTTPException, Depends
from bson import ObjectId
from app.database import get_database
from app.utils.helpers import serialize_mongo
from app.middleware.auth import get_current_user

router = APIRouter(prefix="/notifications", tags=["Notifications"])

@router.get("")
def get_user_notifications(current_user: dict = Depends(get_current_user)):
    db = get_database()
    notifs = list(db.notifications.find({"user_id": current_user["id"]}).sort("created_at", -1).limit(50))
    unread_count = db.notifications.count_documents({"user_id": current_user["id"], "is_read": False})
    return {
        "success": True,
        "items": serialize_mongo(notifs),
        "unread_count": unread_count
    }

@router.patch("/{notif_id}/read")
def mark_notification_read(notif_id: str, current_user: dict = Depends(get_current_user)):
    db = get_database()
    db.notifications.update_one(
        {"_id": ObjectId(notif_id) if ObjectId.is_valid(notif_id) else notif_id, "user_id": current_user["id"]},
        {"$set": {"is_read": True}}
    )
    return {"success": True, "message": "Marked as read"}

@router.patch("/read-all")
def mark_all_read(current_user: dict = Depends(get_current_user)):
    db = get_database()
    db.notifications.update_many({"user_id": current_user["id"]}, {"$set": {"is_read": True}})
    return {"success": True, "message": "All notifications marked as read"}

@router.delete("/{notif_id}")
def delete_notification(notif_id: str, current_user: dict = Depends(get_current_user)):
    db = get_database()
    db.notifications.delete_one(
        {"_id": ObjectId(notif_id) if ObjectId.is_valid(notif_id) else notif_id, "user_id": current_user["id"]}
    )
    return {"success": True, "message": "Notification removed"}

from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime, timezone
from bson import ObjectId
from app.database import get_database
from app.schemas.feedback import FeedbackCreate
from app.utils.helpers import serialize_mongo
from app.middleware.auth import get_current_user, require_admin

router = APIRouter(prefix="/feedback", tags=["Feedback"])

@router.get("")
def list_feedback(current_user: dict = Depends(require_admin)):
    db = get_database()
    feedbacks = list(db.feedback.find().sort("created_at", -1))
    enriched = []
    for f in feedbacks:
        doc = serialize_mongo(f)
        # Find complaint info
        if f.get("complaint_id"):
            c = db.complaints.find_one({"_id": ObjectId(f["complaint_id"])}) if ObjectId.is_valid(f["complaint_id"]) else db.complaints.find_one({"_id": f["complaint_id"]})
            if c:
                doc["complaint_number"] = c.get("complaint_number")
                doc["complaint_title"] = c.get("title")
                doc["department_name"] = c.get("department_name")
        enriched.append(doc)
    return {"success": True, "items": enriched}

@router.post("")
def submit_feedback(req: FeedbackCreate, current_user: dict = Depends(get_current_user)):
    db = get_database()
    comp = db.complaints.find_one({"_id": ObjectId(req.complaint_id)}) if ObjectId.is_valid(req.complaint_id) else db.complaints.find_one({"_id": req.complaint_id})
    if not comp:
        raise HTTPException(status_code=404, detail="Complaint not found")

    if comp["user_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="You can only give feedback for your own complaint")

    # Check if already reviewed
    existing = db.feedback.find_one({"complaint_id": req.complaint_id})
    if existing:
        raise HTTPException(status_code=400, detail="Feedback already submitted for this complaint")

    now = datetime.now(timezone.utc)
    fb_doc = {
        "complaint_id": req.complaint_id,
        "user_id": current_user["id"],
        "user_name": current_user.get("name", "User"),
        "rating": req.rating,
        "comment": req.comment,
        "created_at": now
    }
    insert_res = db.feedback.insert_one(fb_doc)
    fb_doc["id"] = str(insert_res.inserted_id)

    # Attach feedback summary to complaint
    db.complaints.update_one(
        {"_id": comp["_id"]},
        {"$set": {"feedback": {"rating": req.rating, "comment": req.comment, "created_at": now}}}
    )

    return {"success": True, "message": "Thank you for your feedback!", "data": serialize_mongo(fb_doc)}

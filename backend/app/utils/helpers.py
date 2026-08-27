from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any, List
from bson import ObjectId

PRIORITY_SLA_HOURS = {
    "critical": {"response_hours": 1, "resolution_hours": 24},
    "high": {"response_hours": 4, "resolution_hours": 48},
    "medium": {"response_hours": 8, "resolution_hours": 72},
    "low": {"response_hours": 24, "resolution_hours": 120}
}

def generate_complaint_number(db) -> str:
    now = datetime.now(timezone.utc)
    prefix = f"CMP-{now.strftime('%Y%m')}"
    # Count complaints created this month or find highest sequence
    last_complaint = db.complaints.find_one(
        {"complaint_number": {"$regex": f"^{prefix}"}},
        sort=[("complaint_number", -1)]
    )
    if last_complaint and "complaint_number" in last_complaint:
        try:
            seq = int(last_complaint["complaint_number"].split("-")[-1]) + 1
        except Exception:
            seq = db.complaints.count_documents({}) + 1
    else:
        seq = 1
    return f"{prefix}-{seq:04d}"

def calculate_due_date(created_at: datetime, priority: str) -> datetime:
    hours = PRIORITY_SLA_HOURS.get(priority.lower(), PRIORITY_SLA_HOURS["medium"])["resolution_hours"]
    if created_at.tzinfo is None:
        created_at = created_at.replace(tzinfo=timezone.utc)
    return created_at + timedelta(hours=hours)

def evaluate_sla_status(created_at: datetime, due_date: datetime, status: str, resolved_at: Optional[datetime] = None) -> str:
    now = datetime.now(timezone.utc)
    if created_at.tzinfo is None:
        created_at = created_at.replace(tzinfo=timezone.utc)
    if due_date and due_date.tzinfo is None:
        due_date = due_date.replace(tzinfo=timezone.utc)

    if status in ["resolved", "closed"]:
        if resolved_at:
            if resolved_at.tzinfo is None:
                resolved_at = resolved_at.replace(tzinfo=timezone.utc)
            return "within_sla" if resolved_at <= due_date else "breached"
        return "within_sla"

    if not due_date:
        return "within_sla"

    if now > due_date:
        return "breached"
    
    # Check if within 25% of deadline
    total_time = (due_date - created_at).total_seconds()
    time_left = (due_date - now).total_seconds()
    if total_time > 0 and (time_left / total_time) < 0.25:
        return "at_risk"

    return "within_sla"

def serialize_mongo(obj: Any) -> Any:
    if isinstance(obj, list):
        return [serialize_mongo(item) for item in obj]
    if isinstance(obj, dict):
        new_doc = {}
        for k, v in obj.items():
            if k == "_id":
                new_doc["id"] = str(v)
            elif isinstance(v, ObjectId):
                new_doc[k] = str(v)
            elif isinstance(v, datetime):
                new_doc[k] = v.isoformat()
            elif isinstance(v, (dict, list)):
                new_doc[k] = serialize_mongo(v)
            else:
                new_doc[k] = v
        return new_doc
    if isinstance(obj, ObjectId):
        return str(obj)
    if isinstance(obj, datetime):
        return obj.isoformat()
    return obj

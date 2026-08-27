from fastapi import APIRouter, Depends, Query
from typing import Optional
from app.database import get_database
from app.utils.helpers import serialize_mongo
from app.middleware.auth import require_admin

router = APIRouter(prefix="/audit-logs", tags=["Audit Logs"])

@router.get("")
def list_audit_logs(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    action: Optional[str] = None,
    entity: Optional[str] = None,
    current_user: dict = Depends(require_admin)
):
    db = get_database()
    query = {}
    if action and action != "all":
        query["action"] = action
    if entity and entity != "all":
        query["entity"] = entity

    total = db.audit_logs.count_documents(query)
    skip = (page - 1) * limit
    logs = list(db.audit_logs.find(query).sort("timestamp", -1).skip(skip).limit(limit))

    return {
        "success": True,
        "items": serialize_mongo(logs),
        "page": page,
        "limit": limit,
        "total": total,
        "pages": (total + limit - 1) // limit if limit else 1
    }

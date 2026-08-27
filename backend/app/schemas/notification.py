from pydantic import BaseModel
from typing import Optional

class NotificationBase(BaseModel):
    user_id: str
    title: str
    message: str
    type: str # complaint_created, complaint_assigned, status_updated, complaint_resolved, complaint_reopened, new_comment, sla_warning, sla_breach, system
    reference_id: Optional[str] = None
    is_read: bool = False

class NotificationCreate(NotificationBase):
    pass

class NotificationResponse(NotificationBase):
    id: str
    created_at: str

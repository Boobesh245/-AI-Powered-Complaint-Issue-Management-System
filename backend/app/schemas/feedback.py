from pydantic import BaseModel, Field
from typing import Optional

class FeedbackCreate(BaseModel):
    complaint_id: str
    rating: int = Field(..., ge=1, le=5)
    comment: Optional[str] = None

class FeedbackResponse(BaseModel):
    id: str
    complaint_id: str
    user_id: str
    user_name: Optional[str] = None
    rating: int
    comment: Optional[str] = None
    created_at: str

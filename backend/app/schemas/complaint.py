from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

class AttachmentSchema(BaseModel):
    filename: str
    file_path: str
    file_type: str
    file_size: int
    uploaded_at: Optional[str] = None

class CommentCreate(BaseModel):
    message: str
    attachments: Optional[List[str]] = []

class CommentResponse(BaseModel):
    id: str
    complaint_id: str
    user_id: str
    user_name: str
    user_role: str
    message: str
    attachments: Optional[List[Dict[str, Any]]] = []
    created_at: str

class ComplaintCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=200)
    description: str = Field(..., min_length=5)
    category_id: Optional[str] = None
    department_id: Optional[str] = None
    priority: Optional[str] = None # low, medium, high, critical
    location: Optional[str] = None
    attachments: Optional[List[Dict[str, Any]]] = []

class ComplaintUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category_id: Optional[str] = None
    department_id: Optional[str] = None
    priority: Optional[str] = None
    location: Optional[str] = None

class ComplaintStatusUpdate(BaseModel):
    status: str
    comment: Optional[str] = None

class ComplaintPriorityUpdate(BaseModel):
    priority: str
    comment: Optional[str] = None

class ComplaintAssignUpdate(BaseModel):
    assigned_staff_id: str
    comment: Optional[str] = None

class ComplaintBulkAssign(BaseModel):
    complaint_ids: List[str]
    assigned_staff_id: str

class ComplaintBulkStatus(BaseModel):
    complaint_ids: List[str]
    status: str

class ComplaintResponse(BaseModel):
    id: str
    complaint_number: str
    title: str
    description: str
    user_id: str
    user_name: Optional[str] = None
    user_email: Optional[str] = None
    category_id: Optional[str] = None
    category_name: Optional[str] = None
    department_id: Optional[str] = None
    department_name: Optional[str] = None
    assigned_staff_id: Optional[str] = None
    assigned_staff_name: Optional[str] = None
    priority: str
    status: str
    location: Optional[str] = None
    attachments: Optional[List[Dict[str, Any]]] = []
    ai_category: Optional[str] = None
    ai_priority: Optional[str] = None
    ai_sentiment: Optional[str] = None
    ai_confidence: Optional[float] = None
    duplicate_score: Optional[float] = None
    possible_duplicate_ids: Optional[List[str]] = []
    created_at: str
    updated_at: Optional[str] = None
    assigned_at: Optional[str] = None
    resolved_at: Optional[str] = None
    closed_at: Optional[str] = None
    due_date: Optional[str] = None
    sla_status: Optional[str] = None
    comments_count: Optional[int] = 0
    feedback: Optional[Dict[str, Any]] = None

from pydantic import BaseModel
from typing import Optional

class DepartmentBase(BaseModel):
    name: str
    code: str
    description: Optional[str] = None
    head_id: Optional[str] = None
    status: str = "active"

class DepartmentCreate(DepartmentBase):
    pass

class DepartmentUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    description: Optional[str] = None
    head_id: Optional[str] = None
    status: Optional[str] = None

class DepartmentResponse(DepartmentBase):
    id: str
    head_name: Optional[str] = None
    staff_count: Optional[int] = 0
    complaints_count: Optional[int] = 0
    resolved_count: Optional[int] = 0
    resolution_rate: Optional[float] = 0.0
    created_at: Optional[str] = None

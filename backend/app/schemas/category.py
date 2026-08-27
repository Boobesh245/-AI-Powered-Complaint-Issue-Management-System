from pydantic import BaseModel
from typing import Optional

class CategoryBase(BaseModel):
    name: str
    description: Optional[str] = None
    department_id: Optional[str] = None
    priority: str = "medium"
    status: str = "active"

class CategoryCreate(CategoryBase):
    pass

class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    department_id: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None

class CategoryResponse(CategoryBase):
    id: str
    department_name: Optional[str] = None
    complaints_count: Optional[int] = 0
    created_at: Optional[str] = None

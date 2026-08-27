from pydantic import BaseModel
from typing import Optional, List

class StaffBase(BaseModel):
    user_id: str
    employee_id: str
    department_id: str
    designation: str
    specialization: Optional[str] = None
    availability: bool = True
    status: str = "active"

class StaffCreate(BaseModel):
    name: str
    email: str
    password: str
    phone: Optional[str] = None
    employee_id: str
    department_id: str
    designation: str
    specialization: Optional[str] = None

class StaffUpdate(BaseModel):
    designation: Optional[str] = None
    department_id: Optional[str] = None
    specialization: Optional[str] = None
    availability: Optional[bool] = None
    status: Optional[str] = None

class StaffResponse(BaseModel):
    id: str
    user_id: str
    name: str
    email: str
    phone: Optional[str] = None
    employee_id: str
    department_id: str
    department_name: Optional[str] = None
    designation: str
    specialization: Optional[str] = None
    availability: bool = True
    current_workload: int = 0
    resolved_complaints: int = 0
    avg_resolution_hours: float = 0.0
    customer_rating: float = 0.0
    status: str = "active"
    created_at: Optional[str] = None

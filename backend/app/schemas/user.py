from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime

class UserBase(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    role: str = "user" # super_admin, admin, staff, user
    department_id: Optional[str] = None
    status: str = "active" # active, inactive, suspended
    profile_image: Optional[str] = None

class UserCreate(UserBase):
    password: str = Field(..., min_length=6)

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    role: Optional[str] = None
    department_id: Optional[str] = None
    status: Optional[str] = None
    profile_image: Optional[str] = None

class UserStatusUpdate(BaseModel):
    status: str

class UserPasswordUpdate(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=6)

class UserResponse(UserBase):
    id: str
    is_verified: bool = True
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
    last_login: Optional[str] = None
    department_name: Optional[str] = None
    complaints_count: Optional[int] = 0

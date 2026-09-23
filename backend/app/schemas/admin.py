from datetime import date
from typing import Optional

from pydantic import BaseModel, EmailStr


class DepartmentCreate(BaseModel):
    name: str


class DepartmentResponse(BaseModel):
    id: int
    name: str

    model_config = {
        "from_attributes": True
    }


class LeaveTypeCreate(BaseModel):
    name: str
    default_days: int


class LeaveTypeResponse(BaseModel):
    id: int
    name: str
    default_days: int

    model_config = {
        "from_attributes": True
    }


class LeaveBalanceCreate(BaseModel):
    employee_id: int
    leave_type_id: int
    total_days: int
    used_days: int = 0


class LeaveBalanceResponse(BaseModel):
    id: int
    employee_id: int
    leave_type_id: int
    total_days: int
    used_days: int
    remaining_days: int


class UserAdminResponse(BaseModel):
    id: int
    username: str
    email: EmailStr
    role: str
    is_active: bool

    model_config = {
        "from_attributes": True
    }
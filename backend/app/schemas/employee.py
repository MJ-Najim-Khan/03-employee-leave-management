from datetime import date
from typing import Optional

from pydantic import BaseModel, ConfigDict


class EmployeeBase(BaseModel):
    user_id: Optional[int] = None
    employee_code: str
    first_name: str
    last_name: Optional[str] = None
    department_id: Optional[int] = None
    manager_id: Optional[int] = None
    joining_date: Optional[date] = None
    active: bool = True


class EmployeeCreate(EmployeeBase):
    pass


class EmployeeResponse(EmployeeBase):
    id: int

    model_config = ConfigDict(from_attributes=True)
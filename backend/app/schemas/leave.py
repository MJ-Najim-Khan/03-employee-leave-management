from datetime import date
from typing import Optional

from pydantic import BaseModel, model_validator


class LeaveCreate(BaseModel):
    employee_id: int
    leave_type_id: int
    from_date: date
    to_date: date
    reason: Optional[str] = None

    @model_validator(mode="after")
    def validate_dates(self):
        if self.to_date < self.from_date:
            raise ValueError("to_date must be greater than or equal to from_date")
        return self


class LeaveResponse(BaseModel):
    id: int
    employee_id: int
    leave_type_id: int
    from_date: date
    to_date: date
    reason: Optional[str]
    status: str
    manager_comment: Optional[str]

    model_config = {
        "from_attributes": True
    }


class LeaveDecision(BaseModel):
    comment: Optional[str] = None
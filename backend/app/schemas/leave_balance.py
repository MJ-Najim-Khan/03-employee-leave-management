from pydantic import BaseModel


class LeaveBalanceResponse(BaseModel):
    id: int
    employee_id: int
    leave_type_id: int
    leave_type_name: str
    total_days: int
    used_days: int
    remaining_days: int
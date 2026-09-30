from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.employee import Employee
from app.models.leave_balance import LeaveBalance
from app.models.leave_type import LeaveType
from app.models.user import User
from app.auth.dependencies import get_current_user
from app.schemas.leave_balance import LeaveBalanceResponse


router = APIRouter(
    prefix="/api",
    tags=["Leave Balances"]
)


@router.get(
    "/employees/{employee_id}/balances",
    response_model=list[LeaveBalanceResponse]
)
def get_employee_balances(
    employee_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    employee = db.get(Employee, employee_id)

    if employee is None:
        raise HTTPException(
            status_code=404,
            detail="Employee not found"
        )

    balances = (
        db.query(LeaveBalance, LeaveType)
        .join(
            LeaveType,
            LeaveBalance.leave_type_id == LeaveType.id
        )
        .filter(
            LeaveBalance.employee_id == employee_id
        )
        .all()
    )

    return [
        LeaveBalanceResponse(
            id=balance.id,
            employee_id=balance.employee_id,
            leave_type_id=balance.leave_type_id,
            leave_type_name=leave_type.name,
            total_days=balance.total_days,
            used_days=balance.used_days,
            remaining_days=balance.total_days - balance.used_days
        )
        for balance, leave_type in balances
    ]
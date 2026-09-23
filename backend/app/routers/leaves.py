from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.leave_request import LeaveRequest
from app.models.employee import Employee
from app.models.leave_balance import LeaveBalance
from app.models.leave_type import LeaveType
from app.models.user import User
from app.schemas.leave import LeaveCreate, LeaveResponse, LeaveDecision
from app.auth.dependencies import get_current_user, require_roles


router = APIRouter(
    prefix="/api/leaves",
    tags=["Leaves"]
)


@router.post(
    "",
    response_model=LeaveResponse,
    status_code=status.HTTP_201_CREATED
)
def create_leave(
    request: LeaveCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    employee = db.get(
    Employee,
    request.employee_id
)

    if employee is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found"
        )

    leave = LeaveRequest(
        employee_id=request.employee_id,
        leave_type_id=request.leave_type_id,
        from_date=request.from_date,
        to_date=request.to_date,
        reason=request.reason,
        status="PENDING"
    )

    db.add(leave)
    db.commit()
    db.refresh(leave)

    return leave


@router.get(
    "",
    response_model=list[LeaveResponse]
)
def get_leaves(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(LeaveRequest).all()


@router.get(
    "/{leave_id}",
    response_model=LeaveResponse
)
def get_leave(
    leave_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    leave = db.get(LeaveRequest, leave_id)

    if leave is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Leave not found"
        )

    return leave

@router.get(
    "/employees/{employee_id}",
    response_model=list[LeaveResponse]
)
def get_employee_leave_history(
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

    if current_user.role == "EMPLOYEE":
        if employee.user_id != current_user.id:
            raise HTTPException(
                status_code=403,
                detail="You can only view your own leave history"
            )

    leaves = (
        db.query(LeaveRequest)
        .filter(
            LeaveRequest.employee_id == employee_id
        )
        .order_by(LeaveRequest.created_at.desc())
        .all()
    )

    return leaves

@router.put(
    "/{leave_id}/cancel"
)
def cancel_leave(
    leave_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    leave = db.get(LeaveRequest, leave_id)

    if leave is None:
        raise HTTPException(
            status_code=404,
            detail="Leave not found"
        )

    employee = db.get(
        Employee,
        leave.employee_id
    )

    if employee is None:
        raise HTTPException(
            status_code=404,
            detail="Employee not found"
        )

    if current_user.role == "EMPLOYEE":
        if employee.user_id != current_user.id:
            raise HTTPException(
                status_code=403,
                detail="You can only cancel your own leave"
            )

    if leave.status != "PENDING":
        raise HTTPException(
            status_code=400,
            detail=(
                f"Only pending leave can be cancelled. "
                f"Current status: {leave.status}"
            )
        )

    leave.status = "CANCELLED"

    db.commit()
    db.refresh(leave)

    return {
        "message": "Leave cancelled",
        "leave_id": leave.id,
        "status": leave.status
    }

@router.put("/{leave_id}/approve")
def approve_leave(
    leave_id: int,
    request: LeaveDecision,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles("MANAGER", "ADMIN")
    )
):
    leave = db.get(LeaveRequest, leave_id)

    if leave is None:
        raise HTTPException(
            status_code=404,
            detail="Leave not found"
        )

    if leave.status != "PENDING":
        raise HTTPException(
            status_code=400,
            detail=f"Leave is already {leave.status}"
        )

    leave_type = db.get(
        LeaveType,
        leave.leave_type_id
    )

    if leave_type is None:
        raise HTTPException(
            status_code=404,
            detail="Leave type not found"
        )

    balance = (
        db.query(LeaveBalance)
        .filter(
            LeaveBalance.employee_id == leave.employee_id,
            LeaveBalance.leave_type_id == leave.leave_type_id
        )
        .first()
    )

    if balance is None:
        raise HTTPException(
            status_code=404,
            detail="Leave balance not found for this employee"
        )

    leave_days = (
        leave.to_date - leave.from_date
    ).days + 1

    remaining_days = (
        balance.total_days - balance.used_days
    )

    if leave_days > remaining_days:
        raise HTTPException(
            status_code=400,
            detail=(
                f"Insufficient leave balance. "
                f"Available: {remaining_days}, "
                f"Requested: {leave_days}"
            )
        )

    balance.used_days += leave_days

    leave.status = "APPROVED"
    leave.manager_comment = request.comment

    db.commit()

    return {
        "message": "Leave approved",
        "leave_id": leave.id,
        "status": leave.status,
        "days_used": leave_days,
        "remaining_days": (
            balance.total_days - balance.used_days
        )
    }


@router.put(
    "/{leave_id}/reject"
)
def reject_leave(
    leave_id: int,
    request: LeaveDecision,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles("MANAGER", "ADMIN")
    )
):
    leave = db.get(LeaveRequest, leave_id)

    if leave is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Leave not found"
        )

    leave.status = "REJECTED"
    leave.manager_comment = request.comment

    db.commit()

    return {
        "message": "Leave rejected",
        "leave_id": leave.id,
        "status": leave.status
    }
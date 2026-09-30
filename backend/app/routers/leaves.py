from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db

from app.models.leave_request import LeaveRequest
from app.models.employee import Employee
from app.models.leave_balance import LeaveBalance
from app.models.leave_type import LeaveType
from app.models.user import User

from app.schemas.leave import (
    LeaveCreate,
    LeaveResponse,
    LeaveDecision
)

from app.auth.dependencies import (
    get_current_user,
    require_roles
)


router = APIRouter(
    prefix="/api/leaves",
    tags=["Leaves"]
)


# ============================================================
# CREATE LEAVE REQUEST
# ============================================================

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

    # --------------------------------------------------------
    # Find employee
    # --------------------------------------------------------

    employee = db.get(
        Employee,
        request.employee_id
    )

    if employee is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found"
        )


    # --------------------------------------------------------
    # Employee authorization
    #
    # An employee can only create leave for themselves.
    # Managers/Admins can create for other employees.
    # --------------------------------------------------------

    if current_user.role == "EMPLOYEE":

        if employee.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only apply leave for yourself"
            )


    # --------------------------------------------------------
    # Validate leave type
    # --------------------------------------------------------

    leave_type = db.get(
        LeaveType,
        request.leave_type_id
    )

    if leave_type is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Leave type not found"
        )


    # --------------------------------------------------------
    # Validate dates
    # --------------------------------------------------------

    if request.from_date > request.to_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="From date cannot be after to date"
        )


    # --------------------------------------------------------
    # Calculate requested days
    # --------------------------------------------------------

    leave_days = (
        request.to_date - request.from_date
    ).days + 1


    if leave_days <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid leave duration"
        )


    # --------------------------------------------------------
    # Check for overlapping pending/approved leave
    # --------------------------------------------------------

    overlapping_leave = (
        db.query(LeaveRequest)
        .filter(
            LeaveRequest.employee_id == request.employee_id,

            LeaveRequest.status.in_(
                ["PENDING", "APPROVED"]
            ),

            LeaveRequest.from_date <= request.to_date,

            LeaveRequest.to_date >= request.from_date
        )
        .first()
    )


    if overlapping_leave is not None:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "You already have a pending or approved "
                "leave request for these dates"
            )
        )


    # --------------------------------------------------------
    # Create leave request
    # --------------------------------------------------------

    leave = LeaveRequest(
        employee_id=request.employee_id,
        leave_type_id=request.leave_type_id,
        from_date=request.from_date,
        to_date=request.to_date,
        reason=request.reason,
        status="PENDING"
    )


    db.add(leave)

    try:

        db.commit()

        db.refresh(leave)

    except Exception:

        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create leave request"
        )


    return leave


# ============================================================
# GET ALL LEAVES
# ============================================================

@router.get(
    "",
    response_model=list[LeaveResponse]
)
def get_leaves(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    # --------------------------------------------------------
    # ADMIN
    # --------------------------------------------------------

    if current_user.role == "ADMIN":

        return (
            db.query(LeaveRequest)
            .order_by(
                LeaveRequest.created_at.desc()
            )
            .all()
        )


    # --------------------------------------------------------
    # MANAGER
    # --------------------------------------------------------

    if current_user.role == "MANAGER":

        manager = (
            db.query(Employee)
            .filter(
                Employee.user_id == current_user.id
            )
            .first()
        )

        if manager is None:

            raise HTTPException(
                status_code=404,
                detail="Manager employee profile not found"
            )


        team_members = (
            db.query(Employee)
            .filter(
                Employee.manager_id == manager.id,
                Employee.active.is_(True)
            )
            .all()
        )


        team_ids = [
            employee.id
            for employee in team_members
        ]


        if not team_ids:
            return []


        return (
            db.query(LeaveRequest)
            .filter(
                LeaveRequest.employee_id.in_(team_ids)
            )
            .order_by(
                LeaveRequest.created_at.desc()
            )
            .all()
        )


    # --------------------------------------------------------
    # EMPLOYEE
    # --------------------------------------------------------

    employee = (
        db.query(Employee)
        .filter(
            Employee.user_id == current_user.id
        )
        .first()
    )


    if employee is None:

        raise HTTPException(
            status_code=404,
            detail="Employee profile not found"
        )


    return (
        db.query(LeaveRequest)
        .filter(
            LeaveRequest.employee_id == employee.id
        )
        .order_by(
            LeaveRequest.created_at.desc()
        )
        .all()
    )


# ============================================================
# GET SINGLE LEAVE
# ============================================================

@router.get(
    "/{leave_id}",
    response_model=LeaveResponse
)
def get_leave(
    leave_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    leave = db.get(
        LeaveRequest,
        leave_id
    )


    if leave is None:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
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


    # Employee can only view own leave

    if current_user.role == "EMPLOYEE":

        if employee.user_id != current_user.id:

            raise HTTPException(
                status_code=403,
                detail="You can only view your own leave"
            )


    # Manager can view only team leave

    if current_user.role == "MANAGER":

        manager = (
            db.query(Employee)
            .filter(
                Employee.user_id == current_user.id
            )
            .first()
        )


        if manager is None:

            raise HTTPException(
                status_code=404,
                detail="Manager employee profile not found"
            )


        if employee.manager_id != manager.id:

            raise HTTPException(
                status_code=403,
                detail="You can only view your team leave"
            )


    return leave


# ============================================================
# GET EMPLOYEE LEAVE HISTORY
# ============================================================

@router.get(
    "/employees/{employee_id}",
    response_model=list[LeaveResponse]
)
def get_employee_leave_history(
    employee_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    employee = db.get(
        Employee,
        employee_id
    )


    if employee is None:

        raise HTTPException(
            status_code=404,
            detail="Employee not found"
        )


    # --------------------------------------------------------
    # Employee
    # --------------------------------------------------------

    if current_user.role == "EMPLOYEE":

        if employee.user_id != current_user.id:

            raise HTTPException(
                status_code=403,
                detail="You can only view your own leave history"
            )


    # --------------------------------------------------------
    # Manager
    # --------------------------------------------------------

    if current_user.role == "MANAGER":

        manager = (
            db.query(Employee)
            .filter(
                Employee.user_id == current_user.id
            )
            .first()
        )


        if manager is None:

            raise HTTPException(
                status_code=404,
                detail="Manager employee profile not found"
            )


        if employee.manager_id != manager.id:

            raise HTTPException(
                status_code=403,
                detail="Employee is not part of your team"
            )


    # --------------------------------------------------------
    # Get history
    # --------------------------------------------------------

    leaves = (
        db.query(LeaveRequest)
        .filter(
            LeaveRequest.employee_id == employee_id
        )
        .order_by(
            LeaveRequest.created_at.desc()
        )
        .all()
    )


    return leaves


# ============================================================
# CANCEL LEAVE
# ============================================================

@router.put(
    "/{leave_id}/cancel"
)
def cancel_leave(
    leave_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    leave = db.get(
        LeaveRequest,
        leave_id
    )


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


    # --------------------------------------------------------
    # Employee can cancel own leave
    # --------------------------------------------------------

    if current_user.role == "EMPLOYEE":

        if employee.user_id != current_user.id:

            raise HTTPException(
                status_code=403,
                detail="You can only cancel your own leave"
            )


    # --------------------------------------------------------
    # Only PENDING leave can be cancelled
    # --------------------------------------------------------

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


# ============================================================
# APPROVE LEAVE
# ============================================================

@router.put(
    "/{leave_id}/approve"
)
def approve_leave(
    leave_id: int,
    request: LeaveDecision,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles("MANAGER", "ADMIN")
    )
):

    leave = db.get(
        LeaveRequest,
        leave_id
    )


    if leave is None:

        raise HTTPException(
            status_code=404,
            detail="Leave not found"
        )


    # --------------------------------------------------------
    # Only PENDING leave can be approved
    # --------------------------------------------------------

    if leave.status != "PENDING":

        raise HTTPException(
            status_code=400,
            detail=f"Leave is already {leave.status}"
        )


    # --------------------------------------------------------
    # Manager authorization
    # --------------------------------------------------------

    if current_user.role == "MANAGER":

        manager = (
            db.query(Employee)
            .filter(
                Employee.user_id == current_user.id
            )
            .first()
        )


        if manager is None:

            raise HTTPException(
                status_code=404,
                detail="Manager employee profile not found"
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


        if employee.manager_id != manager.id:

            raise HTTPException(
                status_code=403,
                detail="You can only approve leave for your team"
            )


    # --------------------------------------------------------
    # Find leave type
    # --------------------------------------------------------

    leave_type = db.get(
        LeaveType,
        leave.leave_type_id
    )


    if leave_type is None:

        raise HTTPException(
            status_code=404,
            detail="Leave type not found"
        )


    # --------------------------------------------------------
    # Find leave balance
    # --------------------------------------------------------

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


    # --------------------------------------------------------
    # Calculate leave days
    # --------------------------------------------------------

    leave_days = (
        leave.to_date - leave.from_date
    ).days + 1


    if leave_days <= 0:

        raise HTTPException(
            status_code=400,
            detail="Invalid leave duration"
        )


    # --------------------------------------------------------
    # Calculate remaining balance
    # --------------------------------------------------------

    remaining_days = (
        balance.total_days -
        balance.used_days
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


    # --------------------------------------------------------
    # Update balance
    # --------------------------------------------------------

    balance.used_days += leave_days


    # --------------------------------------------------------
    # Approve
    # --------------------------------------------------------

    leave.status = "APPROVED"

    leave.manager_comment = request.comment


    db.commit()

    db.refresh(leave)


    return {
        "message": "Leave approved",
        "leave_id": leave.id,
        "status": leave.status,
        "days_used": leave_days,
        "remaining_days": (
            balance.total_days -
            balance.used_days
        )
    }


# ============================================================
# REJECT LEAVE
# ============================================================

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

    leave = db.get(
        LeaveRequest,
        leave_id
    )


    if leave is None:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Leave not found"
        )


    # --------------------------------------------------------
    # Only pending leave can be rejected
    # --------------------------------------------------------

    if leave.status != "PENDING":

        raise HTTPException(
            status_code=400,
            detail=f"Leave is already {leave.status}"
        )


    # --------------------------------------------------------
    # Manager authorization
    # --------------------------------------------------------

    if current_user.role == "MANAGER":

        manager = (
            db.query(Employee)
            .filter(
                Employee.user_id == current_user.id
            )
            .first()
        )


        if manager is None:

            raise HTTPException(
                status_code=404,
                detail="Manager employee profile not found"
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


        if employee.manager_id != manager.id:

            raise HTTPException(
                status_code=403,
                detail="You can only reject leave for your team"
            )


    # --------------------------------------------------------
    # Reject
    # --------------------------------------------------------

    leave.status = "REJECTED"

    leave.manager_comment = request.comment


    db.commit()

    db.refresh(leave)


    return {
        "message": "Leave rejected",
        "leave_id": leave.id,
        "status": leave.status
    }

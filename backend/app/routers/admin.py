from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db

from app.models.user import User
from app.models.department import Department
from app.models.leave_type import LeaveType
from app.models.leave_balance import LeaveBalance
from app.models.employee import Employee

from app.schemas.admin import (
    DepartmentCreate,
    DepartmentResponse,
    LeaveTypeCreate,
    LeaveTypeResponse,
    LeaveBalanceCreate,
    LeaveBalanceResponse,
    UserAdminResponse,
)

from app.auth.dependencies import require_roles


router = APIRouter(
    prefix="/api/admin",
    tags=["Admin"],
)


# --------------------------------------------------
# Departments
# --------------------------------------------------

@router.get(
    "/departments",
    response_model=list[DepartmentResponse],
)
def get_departments(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("ADMIN")),
):
    return db.query(Department).order_by(
        Department.id
    ).all()


@router.post(
    "/departments",
    response_model=DepartmentResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_department(
    request: DepartmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("ADMIN")),
):
    existing = db.query(Department).filter(
        Department.name == request.name
    ).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Department already exists",
        )

    department = Department(
        name=request.name
    )

    db.add(department)
    db.commit()
    db.refresh(department)

    return department


# --------------------------------------------------
# Leave Types
# --------------------------------------------------

@router.get(
    "/leave-types",
    response_model=list[LeaveTypeResponse],
)
def get_leave_types(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("ADMIN")),
):
    return db.query(LeaveType).order_by(
        LeaveType.id
    ).all()


@router.post(
    "/leave-types",
    response_model=LeaveTypeResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_leave_type(
    request: LeaveTypeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("ADMIN")),
):
    if request.default_days <= 0:
        raise HTTPException(
            status_code=400,
            detail="default_days must be greater than 0",
        )

    leave_type = LeaveType(
        name=request.name,
        default_days=request.default_days,
    )

    db.add(leave_type)
    db.commit()
    db.refresh(leave_type)

    return leave_type


# --------------------------------------------------
# Leave Balances
# --------------------------------------------------

@router.post(
    "/leave-balances",
    response_model=LeaveBalanceResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_leave_balance(
    request: LeaveBalanceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("ADMIN")),
):
    employee = db.get(
        Employee,
        request.employee_id
    )

    if employee is None:
        raise HTTPException(
            status_code=404,
            detail="Employee not found",
        )

    leave_type = db.get(
        LeaveType,
        request.leave_type_id
    )

    if leave_type is None:
        raise HTTPException(
            status_code=404,
            detail="Leave type not found",
        )

    if request.total_days < 0:
        raise HTTPException(
            status_code=400,
            detail="total_days cannot be negative",
        )

    if request.used_days < 0:
        raise HTTPException(
            status_code=400,
            detail="used_days cannot be negative",
        )

    if request.used_days > request.total_days:
        raise HTTPException(
            status_code=400,
            detail="used_days cannot exceed total_days",
        )

    existing = (
        db.query(LeaveBalance)
        .filter(
            LeaveBalance.employee_id == request.employee_id,
            LeaveBalance.leave_type_id == request.leave_type_id,
        )
        .first()
    )

    if existing:
        existing.total_days = request.total_days
        existing.used_days = request.used_days

        db.commit()
        db.refresh(existing)

        return LeaveBalanceResponse(
            id=existing.id,
            employee_id=existing.employee_id,
            leave_type_id=existing.leave_type_id,
            total_days=existing.total_days,
            used_days=existing.used_days,
            remaining_days=(
                existing.total_days - existing.used_days
            ),
        )

    balance = LeaveBalance(
        employee_id=request.employee_id,
        leave_type_id=request.leave_type_id,
        total_days=request.total_days,
        used_days=request.used_days,
    )

    db.add(balance)
    db.commit()
    db.refresh(balance)

    return LeaveBalanceResponse(
        id=balance.id,
        employee_id=balance.employee_id,
        leave_type_id=balance.leave_type_id,
        total_days=balance.total_days,
        used_days=balance.used_days,
        remaining_days=(
            balance.total_days - balance.used_days
        ),
    )


@router.get(
    "/leave-balances/{employee_id}",
    response_model=list[LeaveBalanceResponse],
)
def get_employee_balance(
    employee_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("ADMIN")),
):
    balances = (
        db.query(LeaveBalance)
        .filter(
            LeaveBalance.employee_id == employee_id
        )
        .order_by(LeaveBalance.leave_type_id)
        .all()
    )

    return [
        LeaveBalanceResponse(
            id=balance.id,
            employee_id=balance.employee_id,
            leave_type_id=balance.leave_type_id,
            total_days=balance.total_days,
            used_days=balance.used_days,
            remaining_days=(
                balance.total_days - balance.used_days
            ),
        )
        for balance in balances
    ]


# --------------------------------------------------
# Users
# --------------------------------------------------

@router.get(
    "/users",
    response_model=list[UserAdminResponse],
)
def get_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("ADMIN")),
):
    return db.query(User).order_by(
        User.id
    ).all()


@router.put(
    "/users/{user_id}/disable",
)
def disable_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("ADMIN")),
):
    user = db.get(User, user_id)

    if user is None:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )

    if user.id == current_user.id:
        raise HTTPException(
            status_code=400,
            detail="Admin cannot disable their own account",
        )

    user.is_active = False

    db.commit()

    return {
        "message": "User disabled",
        "user_id": user.id,
        "is_active": user.is_active,
    }
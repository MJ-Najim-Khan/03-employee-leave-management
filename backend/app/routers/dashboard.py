from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.database import get_db

from app.models.user import User
from app.models.employee import Employee
from app.models.leave_request import LeaveRequest
from app.models.leave_balance import LeaveBalance
from app.models.document import Document
from app.models.department import Department

from app.schemas.dashboard import DashboardResponse


router = APIRouter(
    prefix="/api",
    tags=["Dashboard"],
)


@router.get(
    "/dashboard",
    response_model=DashboardResponse,
)
def get_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # --------------------------------------------------
    # EMPLOYEE DASHBOARD
    # --------------------------------------------------

    if current_user.role == "EMPLOYEE":

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
                detail="Employee profile not found",
            )

        leaves = (
            db.query(LeaveRequest)
            .filter(
                LeaveRequest.employee_id == employee.id
            )
            .all()
        )

        balances = (
            db.query(LeaveBalance)
            .filter(
                LeaveBalance.employee_id == employee.id
            )
            .all()
        )

        documents_count = (
            db.query(Document)
            .filter(
                Document.employee_id == employee.id
            )
            .count()
        )

        pending = sum(
            1 for leave in leaves
            if leave.status == "PENDING"
        )

        approved = sum(
            1 for leave in leaves
            if leave.status == "APPROVED"
        )

        rejected = sum(
            1 for leave in leaves
            if leave.status == "REJECTED"
        )

        cancelled = sum(
            1 for leave in leaves
            if leave.status == "CANCELLED"
        )

        total_remaining = sum(
            balance.total_days - balance.used_days
            for balance in balances
        )

        return {
            "role": "EMPLOYEE",
            "data": {
                "employee_id": employee.id,
                "employee_code": employee.employee_code,
                "first_name": employee.first_name,
                "last_name": employee.last_name,
                "leave_requests": len(leaves),
                "pending_leaves": pending,
                "approved_leaves": approved,
                "rejected_leaves": rejected,
                "cancelled_leaves": cancelled,
                "remaining_leave_days": total_remaining,
                "documents": documents_count,
            },
        }


    # --------------------------------------------------
    # MANAGER DASHBOARD
    # --------------------------------------------------

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
                detail="Manager employee profile not found",
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

        if team_ids:
            team_leaves = (
                db.query(LeaveRequest)
                .filter(
                    LeaveRequest.employee_id.in_(
                        team_ids
                    )
                )
                .all()
            )
        else:
            team_leaves = []

        pending = sum(
            1 for leave in team_leaves
            if leave.status == "PENDING"
        )

        approved = sum(
            1 for leave in team_leaves
            if leave.status == "APPROVED"
        )

        rejected = sum(
            1 for leave in team_leaves
            if leave.status == "REJECTED"
        )

        return {
            "role": "MANAGER",
            "data": {
                "manager_employee_id": manager.id,
                "team_members": len(team_members),
                "pending_leave_requests": pending,
                "approved_leave_requests": approved,
                "rejected_leave_requests": rejected,
            },
        }


    # --------------------------------------------------
    # ADMIN DASHBOARD
    # --------------------------------------------------

    if current_user.role == "ADMIN":

        total_users = (
            db.query(User).count()
        )

        active_users = (
            db.query(User)
            .filter(
                User.is_active.is_(True)
            )
            .count()
        )

        total_employees = (
            db.query(Employee).count()
        )

        active_employees = (
            db.query(Employee)
            .filter(
                Employee.active.is_(True)
            )
            .count()
        )

        total_departments = (
            db.query(Department).count()
            )

        pending_leaves = (
            db.query(LeaveRequest)
            .filter(
                LeaveRequest.status == "PENDING"
            )
            .count()
        )

        approved_leaves = (
            db.query(LeaveRequest)
            .filter(
                LeaveRequest.status == "APPROVED"
            )
            .count()
        )

        rejected_leaves = (
            db.query(LeaveRequest)
            .filter(
                LeaveRequest.status == "REJECTED"
            )
            .count()
        )

        cancelled_leaves = (
            db.query(LeaveRequest)
            .filter(
                LeaveRequest.status == "CANCELLED"
            )
            .count()
        )

        documents = (
            db.query(Document).count()
        )

        return {
            "role": "ADMIN",
            "data": {
                "total_users": total_users,
                "active_users": active_users,
                "total_employees": total_employees,
                "active_employees": active_employees,
                "total_departments": total_departments,
                "pending_leave_requests": pending_leaves,
                "approved_leave_requests": approved_leaves,
                "rejected_leave_requests": rejected_leaves,
                "cancelled_leave_requests": cancelled_leaves,
                "documents": documents,
            },
        }


    raise HTTPException(
        status_code=403,
        detail="Unsupported user role",
    )
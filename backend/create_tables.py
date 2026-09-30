from app.database import engine, Base

from app.models.user import User
from app.models.department import Department
from app.models.employee import Employee
from app.models.leave_type import LeaveType
from app.models.leave_balance import LeaveBalance
from app.models.leave_request import LeaveRequest
from app.models.document import Document
from app.models.audit_log import AuditLog


Base.metadata.create_all(bind=engine)

print("All database tables created successfully.")
from sqlalchemy import Column, Integer, ForeignKey

from app.database import Base


class LeaveBalance(Base):
    __tablename__ = "leave_balances"

    id = Column(Integer, primary_key=True)
    employee_id = Column(Integer, ForeignKey("employees.id"))
    leave_type_id = Column(Integer, ForeignKey("leave_types.id"))
    total_days = Column(Integer, nullable=False)
    used_days = Column(Integer, default=0)
from sqlalchemy import Column, Integer, String

from app.database import Base


class LeaveType(Base):
    __tablename__ = "leave_types"

    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    default_days = Column(Integer, nullable=False)
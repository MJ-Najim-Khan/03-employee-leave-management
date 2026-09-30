from typing import Any

from pydantic import BaseModel


class DashboardResponse(BaseModel):
    role: str
    data: dict[str, Any]
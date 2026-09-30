from datetime import datetime

from pydantic import BaseModel


class DocumentResponse(BaseModel):
    id: int
    employee_id: int
    file_name: str | None
    s3_key: str | None
    uploaded_at: datetime | None

    model_config = {
        "from_attributes": True
    }
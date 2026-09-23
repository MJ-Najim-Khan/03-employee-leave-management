import os
import uuid

import boto3

from botocore.exceptions import BotoCoreError, ClientError

from fastapi import (
    APIRouter,
    Depends,
    File,
    HTTPException,
    UploadFile,
)

from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.database import get_db

from app.models.document import Document
from app.models.employee import Employee
from app.models.user import User

from app.schemas.document import DocumentResponse


router = APIRouter(
    prefix="/api/documents",
    tags=["Documents"],
)


AWS_REGION = os.getenv(
    "AWS_REGION",
    "ap-southeast-1"
)

DOCUMENT_BUCKET = os.getenv(
    "DOCUMENT_BUCKET"
)


if not DOCUMENT_BUCKET:
    raise RuntimeError(
        "DOCUMENT_BUCKET is not configured"
    )


s3_client = boto3.client(
    "s3",
    region_name=AWS_REGION
)


# --------------------------------------------------
# Upload document
# --------------------------------------------------

@router.post(
    "/upload",
    response_model=DocumentResponse
)
def upload_document(
    employee_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
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

    if current_user.role == "EMPLOYEE":
        if employee.user_id != current_user.id:
            raise HTTPException(
                status_code=403,
                detail=(
                    "You can only upload documents "
                    "for your own employee account"
                )
            )

    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="File name is required"
        )

    extension = ""

    if "." in file.filename:
        extension = (
            "." + file.filename.rsplit(".", 1)[1].lower()
        )

    document_id = uuid.uuid4().hex

    s3_key = (
        f"employees/"
        f"{employee_id}/"
        f"{document_id}{extension}"
    )

    try:
        s3_client.upload_fileobj(
            file.file,
            DOCUMENT_BUCKET,
            s3_key,
            ExtraArgs={
                "ContentType": (
                    file.content_type
                    or "application/octet-stream"
                )
            }
        )

    except (BotoCoreError, ClientError) as exc:
        raise HTTPException(
            status_code=500,
            detail=f"S3 upload failed: {exc}"
        )

    document = Document(
        employee_id=employee_id,
        file_name=file.filename,
        s3_key=s3_key
    )

    db.add(document)
    db.commit()
    db.refresh(document)

    return document


# --------------------------------------------------
# List employee documents
# --------------------------------------------------

@router.get(
    "/employee/{employee_id}",
    response_model=list[DocumentResponse]
)
def get_employee_documents(
    employee_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
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

    if current_user.role == "EMPLOYEE":
        if employee.user_id != current_user.id:
            raise HTTPException(
                status_code=403,
                detail=(
                    "You can only view your own documents"
                )
            )

    documents = (
        db.query(Document)
        .filter(
            Document.employee_id == employee_id
        )
        .order_by(
            Document.id.desc()
        )
        .all()
    )

    return documents


# --------------------------------------------------
# Generate secure download URL
# --------------------------------------------------

@router.get(
    "/{document_id}/download"
)
def download_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    document = db.get(
        Document,
        document_id
    )

    if document is None:
        raise HTTPException(
            status_code=404,
            detail="Document not found"
        )

    employee = db.get(
        Employee,
        document.employee_id
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
                detail=(
                    "You can only download your own documents"
                )
            )

    try:
        download_url = s3_client.generate_presigned_url(
            "get_object",
            Params={
                "Bucket": DOCUMENT_BUCKET,
                "Key": document.s3_key,
            },
            ExpiresIn=300
        )

    except (BotoCoreError, ClientError) as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Unable to generate download URL: {exc}"
        )

    return {
        "document_id": document.id,
        "file_name": document.file_name,
        "download_url": download_url,
        "expires_in_seconds": 300
    }
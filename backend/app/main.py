import os

from dotenv import load_dotenv

load_dotenv()

import app.models

from fastapi import FastAPI
from sqlalchemy import text
from fastapi.middleware.cors import CORSMiddleware

from app.database import engine
from app.routers.auth import router as auth_router
from app.routers.employees import router as employee_router
from app.routers.leaves import router as leave_router
from app.routers.leave_balances import router as leave_balance_router
from app.routers.admin import router as admin_router
from app.routers.documents import router as document_router
from app.routers.dashboard import router as dashboard_router

app = FastAPI(
    title="Employee Leave Management System",
    description="Employee Leave Management API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://d2hzg5hj2i2lr0.cloudfront.net"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(employee_router)
app.include_router(leave_router)
app.include_router(leave_balance_router)
app.include_router(admin_router)
app.include_router(document_router)
app.include_router(dashboard_router)


@app.get("/")
def root():
    return {
        "message": "Employee Leave Management System API",
        "status": "running"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }


@app.get("/health/database")
def database_health():
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))

        return {
            "status": "healthy",
            "database": "connected"
        }

    except Exception as e:
        return {
            "status": "unhealthy",
            "database": "connection failed",
            "error": str(e)
        }
import os

from dotenv import load_dotenv

from datetime import datetime, timedelta, timezone

from jose import jwt
from passlib.context import CryptContext


load_dotenv()


SECRET_KEY = os.getenv(
    "JWT_SECRET"
)

if not SECRET_KEY:
    raise RuntimeError(
        "JWT_SECRET is not configured"
    )


ALGORITHM = "HS256"


pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(
    password: str,
    hashed_password: str
) -> bool:
    return pwd_context.verify(
        password,
        hashed_password
    )


def create_token(
    user_id: int,
    role: str
) -> str:

    payload = {
        "sub": str(user_id),
        "role": role,
        "exp": (
            datetime.now(timezone.utc)
            + timedelta(hours=8)
        )
    }

    return jwt.encode(
        payload,
        SECRET_KEY,
        algorithm=ALGORITHM
    )
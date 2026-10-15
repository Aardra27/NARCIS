from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from backend.auth.security import verify_password
from backend.database.database import get_db
from backend.database.models import Officer

router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"]
)


class LoginRequest(BaseModel):
    officer_id: str
    password: str


@router.post("/login")
def login(
    credentials: LoginRequest,
    db: Session = Depends(get_db)
):
    officer = (
        db.query(Officer)
        .filter(
            Officer.officer_id == credentials.officer_id
        )
        .first()
    )

    if officer is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid Officer ID or password."
        )

    if officer.status != "Active":
        raise HTTPException(
            status_code=403,
            detail="Officer account is inactive."
        )

    if not verify_password(
        credentials.password,
        officer.password_hash
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid Officer ID or password."
        )

    officer.last_login = datetime.utcnow()
    db.commit()

    return {
        "authenticated": True,
        "officer": {
            "officer_id": officer.officer_id,
            "name": officer.name,
            "role": officer.role
        }
    }

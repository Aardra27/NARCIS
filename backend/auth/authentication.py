from sqlalchemy.orm import Session

from backend.auth.security import hash_password
from backend.database.models import Officer


def create_officer(
    db: Session,
    officer_id: str,
    password: str,
    name: str,
    role: str = "Officer"
):
    officer = Officer(
        officer_id=officer_id,
        password_hash=hash_password(password),
        name=name,
        role=role,
        status="Active"
    )

    db.add(officer)
    db.commit()
    db.refresh(officer)

    return officer

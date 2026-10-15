from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime

from backend.database.database import Base


class Officer(Base):
    __tablename__ = "officers"

    id = Column(Integer, primary_key=True, index=True)
    officer_id = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    name = Column(String, nullable=False)
    role = Column(String, nullable=False, default="Officer")
    status = Column(String, nullable=False, default="Active")
    created_at = Column(DateTime, default=datetime.utcnow)
    last_login = Column(DateTime, nullable=True)


class Case(Base):
    __tablename__ = "cases"

    id = Column(Integer, primary_key=True, index=True)

    case_id = Column(String, unique=True, index=True, nullable=False)
    drug_type = Column(String, nullable=False, default="Unknown")
    quantity = Column(String, nullable=False, default="Unknown")

    priority = Column(String, nullable=False, default="Medium")
    status = Column(String, nullable=False, default="Active")

    verification_status = Column(
        String,
        nullable=False,
        default="Pending Verification"
    )

    route = Column(String, nullable=False, default="Unknown")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)

import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Boolean
from sqlalchemy.orm import relationship
from app.db.base import Base
from app.db.guid import GUID

class User(Base):
    __tablename__ = "users"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="user", nullable=False) # admin, manager, user
    is_active = Column(Boolean, default=True)
    is_two_factor_enabled = Column(Boolean, default=False)
    two_factor_secret = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


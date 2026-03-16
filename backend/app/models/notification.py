import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship

from app.db.base import Base
from app.db.guid import GUID

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4, index=True)
    message = Column(String, nullable=False)
    is_read = Column(Boolean, default=False, nullable=False)
    user_id = Column(GUID(), ForeignKey("users.id"), nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", backref="notifications")

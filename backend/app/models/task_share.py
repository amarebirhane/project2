import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from app.db.base import Base
from app.db.guid import GUID

class TaskShare(Base):
    __tablename__ = "task_shares"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4, index=True)
    task_id = Column(GUID(), ForeignKey("tasks.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(GUID(), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Permission level: "read" or "write"
    permission = Column(String, default="read", nullable=False) 
    
    shared_at = Column(DateTime, default=datetime.utcnow)

    task = relationship("Task", backref="shares")
    user = relationship("User", backref="shared_tasks")

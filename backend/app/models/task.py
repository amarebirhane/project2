import uuid
from datetime import datetime
from sqlalchemy.orm import relationship

from app.db.base import Base
from app.db.guid import GUID

class Task(Base):
    __tablename__ = "tasks"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4, index=True)
    title = Column(String, index=True, nullable=False)
    description = Column(String, nullable=True)
    priority = Column(String, nullable=False) # e.g. low, medium, high
    status = Column(String, default="pending", nullable=False, index=True) # pending, in_progress, completed
    deadline = Column(DateTime, nullable=True)
    user_id = Column(GUID(), ForeignKey("users.id"), nullable=False, index=True)
    category_id = Column(GUID(), ForeignKey("categories.id"), nullable=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", backref="tasks")
    category = relationship("Category", backref="tasks")

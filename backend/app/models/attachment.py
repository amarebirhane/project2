import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.base import Base

class Attachment(Base):
    __tablename__ = "attachments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    task_id = Column(UUID(as_uuid=True), ForeignKey("tasks.id", ondelete="CASCADE"), nullable=False, index=True)
    
    file_name = Column(String, nullable=False)
    file_path = Column(String, nullable=False) # Local path or URL
    file_type = Column(String, nullable=False) # mime-type
    file_size = Column(Integer, nullable=False) # in bytes
    
    uploaded_at = Column(DateTime, default=datetime.utcnow)

    task = relationship("Task", backref="attachments")

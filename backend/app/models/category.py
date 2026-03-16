import uuid
from sqlalchemy import Column, String, ForeignKey
from sqlalchemy.orm import relationship

from app.db.base import Base
from app.db.guid import GUID

class Category(Base):
    __tablename__ = "categories"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4, index=True)
    name = Column(String, index=True, nullable=False)
    user_id = Column(GUID(), ForeignKey("users.id"), nullable=False, index=True)

    owner = relationship("User", backref="categories")

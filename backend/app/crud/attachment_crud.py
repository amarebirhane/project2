from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.attachment import Attachment
from app.schemas.attachment_schema import AttachmentCreate

def create_attachment(db: Session, attachment: AttachmentCreate):
    db_attachment = Attachment(**attachment.model_dump())
    db.add(db_attachment)
    db.commit()
    db.refresh(db_attachment)
    return db_attachment

def get_attachments_for_task(db: Session, task_id: str) -> List[Attachment]:
    return db.query(Attachment).filter(Attachment.task_id == task_id).all()

def get_attachment(db: Session, attachment_id: str) -> Optional[Attachment]:
    return db.query(Attachment).filter(Attachment.id == attachment_id).first()

def delete_attachment(db: Session, db_attachment: Attachment):
    import os
    # Delete the physical file
    if os.path.exists(db_attachment.file_path):
        os.remove(db_attachment.file_path)
    
    db.delete(db_attachment)
    db.commit()
    return True

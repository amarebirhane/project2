from typing import Any, Optional
from sqlalchemy.orm import Session
from app.models.audit_log import AuditLog

class AuditService:
    @staticmethod
    def log(
        db: Session,
        *,
        user_id: Optional[Any] = None,
        username: Optional[str] = None,
        action: str,
        target_type: Optional[str] = None,
        target_id: Optional[str] = None,
        details: Optional[dict] = None,
        ip_address: Optional[str] = None
    ) -> Optional[AuditLog]:
        try:
            db_log = AuditLog(
                user_id=user_id,
                username=username,
                action=action,
                target_type=target_type,
                target_id=target_id,
                details=details,
                ip_address=ip_address
            )
            db.add(db_log)
            db.commit()
            db.refresh(db_log)
            return db_log
        except Exception:
            # If audit_logs table doesn't exist yet, don't break the main operation
            db.rollback()
            return None

audit_service = AuditService()

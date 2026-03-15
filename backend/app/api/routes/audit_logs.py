from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.api import deps
from app.schemas.audit_schema import AuditLogResponse
from app.models.audit_log import AuditLog

router = APIRouter()

@router.get("/", response_model=List[AuditLogResponse])
def get_audit_logs(
    db: Session = Depends(deps.get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    current_user: Any = Depends(deps.get_current_active_admin_user),
) -> Any:
    """
    Retrieve audit logs. (Admin only)
    """
    logs = db.query(AuditLog).order_by(AuditLog.created_at.desc()).offset(skip).limit(limit).all()
    return logs

from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.api import deps
from app.schemas.audit_schema import AuditLogResponse
from app.schemas.pagination_schema import PaginatedResponse
from app.models.audit_log import AuditLog
from fastapi.responses import StreamingResponse
from fpdf import FPDF
import io

from app.utils.cache import cache

router = APIRouter()

@router.get("/", response_model=PaginatedResponse[AuditLogResponse])
@cache(expire=3600)
def read_audit_logs(
    db: Session = Depends(deps.get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(8, ge=1, le=500), # Default to 8
    current_user: Any = Depends(deps.get_current_active_admin_user),
) -> Any:
    """
    Retrieve audit logs. (Admin only)
    """
    query = db.query(AuditLog)
    total = query.count()
    logs = query.order_by(AuditLog.created_at.desc()).offset(skip).limit(limit).all()
    
    import math
    return {
        "items": logs,
        "total": total,
        "page": (skip // limit) + 1 if limit > 0 else 1,
        "size": limit,
        "pages": math.ceil(total / limit) if limit > 0 else 1
    }
@router.get("/export/pdf")
def export_audit_logs_pdf(
    db: Session = Depends(deps.get_db),
    current_user: Any = Depends(deps.get_current_active_admin_user),
) -> Any:
    """
    Export all audit logs to PDF. (Admin only)
    """
    logs = db.query(AuditLog).order_by(AuditLog.created_at.desc()).all()
    
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("helvetica", "B", 16)
    pdf.cell(0, 10, "Audit Logs Report", ln=True, align="C")
    pdf.set_font("helvetica", "", 10)
    import datetime
    pdf.cell(0, 10, f"Generated at: {datetime.datetime.now().isoformat()}", ln=True, align="C")
    pdf.ln(10)
    
    # Table Header
    pdf.set_fill_color(240, 240, 240)
    pdf.set_font("helvetica", "B", 10)
    pdf.cell(40, 10, "Date", border=1, fill=True)
    pdf.cell(30, 10, "Username", border=1, fill=True)
    pdf.cell(40, 10, "Action", border=1, fill=True)
    pdf.cell(80, 10, "Details", border=1, fill=True)
    pdf.ln()
    
    # Table Data
    pdf.set_font("helvetica", "", 8)
    for log in logs:
        # Truncate details if too long
        details_str = str(log.details)[:50] + "..." if len(str(log.details)) > 50 else str(log.details)
        
        pdf.cell(40, 10, log.created_at.strftime("%Y-%m-%d %H:%M"), border=1)
        pdf.cell(30, 10, str(log.username or "System"), border=1)
        pdf.cell(40, 10, str(log.action), border=1)
        pdf.cell(80, 10, details_str, border=1)
        pdf.ln()
    
    # Use output() to get bytes directly
    pdf_bytes = pdf.output()
    
    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=audit_logs_export.pdf"}
    )

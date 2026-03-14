from typing import Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.api import deps
from app.models.task import Task
from app.models.user import User
from app.schemas.analytics_schema import UserAnalytics, SystemAnalytics, TaskStatusCount

router = APIRouter()

@router.get("/me", response_model=UserAnalytics)
def get_user_analytics(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get analytics for the current user.
    """
    total = db.query(Task).filter(Task.user_id == current_user.id).count()
    completed = db.query(Task).filter(Task.user_id == current_user.id, Task.status == "completed").count()
    pending = total - completed
    
    # Priority breakdown
    priorities = db.query(Task.priority, func.count(Task.id)).filter(Task.user_id == current_user.id).group_by(Task.priority).all()
    priority_dict = {p: count for p, count in priorities}
    
    # Status breakdown
    statuses = db.query(Task.status, func.count(Task.id)).filter(Task.user_id == current_user.id).group_by(Task.status).all()
    status_list = [TaskStatusCount(status=s, count=c) for s, c in statuses]
    
    return {
        "total_tasks": total,
        "completed_tasks": completed,
        "pending_tasks": pending,
        "tasks_by_priority": priority_dict,
        "tasks_by_status": status_list,
    }

@router.get("/system", response_model=SystemAnalytics)
def get_system_analytics(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_admin),
) -> Any:
    """
    Get system-wide analytics (Admin only).
    """
    user_data = get_user_analytics(db, current_user)
    total_users = db.query(User).count()
    
    return {
        **user_data,
        "total_users": total_users,
        "active_users": total_users, # Placeholder
    }

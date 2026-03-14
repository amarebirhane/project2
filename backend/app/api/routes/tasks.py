from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api import deps
from app.crud.task_crud import (
    get_task,
    get_tasks,
    get_user_tasks,
    create_user_task,
    update_task,
    delete_task,
)
from app.schemas.task_schema import TaskResponse, TaskCreate, TaskUpdate
from app.models.user import User

router = APIRouter()

@router.get("/", response_model=List[TaskResponse])
def read_tasks(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve tasks. Admin or manager can access all tasks (for team management). 
    Users only see their own tasks.
    """
    if current_user.role in ["admin", "manager"]:
        tasks = get_tasks(db, skip=skip, limit=limit)
    else:
        tasks = get_user_tasks(db=db, user_id=current_user.id, skip=skip, limit=limit)
    return tasks

@router.post("/", response_model=TaskResponse)
def create_task(
    *,
    db: Session = Depends(deps.get_db),
    task_in: TaskCreate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Create new task.
    """
    task = create_user_task(db=db, task=task_in, user_id=str(current_user.id))
    return task

@router.put("/{id}", response_model=TaskResponse)
def update_task_route(
    *,
    db: Session = Depends(deps.get_db),
    id: str,
    task_in: TaskUpdate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Update a task.
    """
    task = get_task(db=db, task_id=id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    if not (current_user.role in ["admin", "manager"] or task.user_id == current_user.id):
        raise HTTPException(status_code=400, detail="Not enough permissions")
    task = update_task(db=db, db_task=task, task_in=task_in)
    return task

@router.delete("/{id}", response_model=TaskResponse)
def delete_task_route(
    *,
    db: Session = Depends(deps.get_db),
    id: str,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Delete an task. Admin can delete any task. Users delete their own.
    """
    task = get_task(db=db, task_id=id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    if not (current_user.role == "admin" or task.user_id == current_user.id):
        raise HTTPException(status_code=400, detail="Not enough permissions")
    delete_task(db=db, db_task=task)
    return task

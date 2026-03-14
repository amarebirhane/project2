from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api import deps
from app.crud.category_crud import (
    get_category,
    get_categories,
    get_user_categories,
    create_user_category,
    delete_category,
)
from app.schemas.category_schema import CategoryResponse, CategoryCreate
from app.models.user import User

router = APIRouter()

@router.get("/", response_model=List[CategoryResponse])
def read_categories(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve categories. Managers/Admins can view all, users view their own.
    """
    if current_user.role in ["admin", "manager"]:
        categories = get_categories(db, skip=skip, limit=limit)
    else:
        categories = get_user_categories(db=db, user_id=current_user.id, skip=skip, limit=limit)
    return categories

@router.post("/", response_model=CategoryResponse)
def create_category(
    *,
    db: Session = Depends(deps.get_db),
    category_in: CategoryCreate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Create new category.
    """
    category = create_user_category(db=db, category=category_in, user_id=str(current_user.id))
    return category

@router.delete("/{id}", response_model=CategoryResponse)
def delete_category_route(
    *,
    db: Session = Depends(deps.get_db),
    id: str,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Delete a category.
    """
    category = get_category(db=db, category_id=id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    if not (current_user.role == "admin" or category.user_id == current_user.id):
        raise HTTPException(status_code=400, detail="Not enough permissions")
    delete_category(db=db, db_category=category)
    return category

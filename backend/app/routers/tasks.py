from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import Optional
import uuid
from ..dependencies import get_current_user, get_task_repository
from ..repositories.task_repository import TaskRepository
from ..schemas.task import TaskCreate, TaskResponse, TaskListResponse
from ..models.task import TaskStatus, TaskPriority
from ..models.user import User

router = APIRouter()


@router.post("/", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(
    task: TaskCreate,
    current_user: User = Depends(get_current_user),
    repo: TaskRepository = Depends(get_task_repository),
):
    return repo.create(current_user.id, task)


@router.get("/", response_model=TaskListResponse)
def read_tasks(
    status: Optional[TaskStatus] = None,
    priority: Optional[TaskPriority] = None,
    q: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    sort_by: str = Query(
        "created_at", pattern="^(created_at|due_date|priority|title)$"
    ),
    sort_dir: str = Query("desc", pattern="^(asc|desc)$"),
    current_user: User = Depends(get_current_user),
    repo: TaskRepository = Depends(get_task_repository),
):
    items, total = repo.get_all(
        user_id=current_user.id,
        page=page,
        page_size=page_size,
        status=status.value if status else None,
        priority=priority.value if priority else None,
        q=q,
        sort_by=sort_by,
        sort_dir=sort_dir,
    )
    return {"items": items, "total": total, "page": page, "page_size": page_size}


@router.get("/{task_id}", response_model=TaskResponse)
def read_task(
    task_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    repo: TaskRepository = Depends(get_task_repository),
):
    task = repo.get_by_id(current_user.id, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@router.put("/{task_id}", response_model=TaskResponse)
def update_task(
    task_id: uuid.UUID,
    task: TaskCreate,
    current_user: User = Depends(get_current_user),
    repo: TaskRepository = Depends(get_task_repository),
):
    updated = repo.update(current_user.id, task_id, task)
    if not updated:
        raise HTTPException(status_code=404, detail="Task not found")
    return updated


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    task_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    repo: TaskRepository = Depends(get_task_repository),
):
    if not repo.delete(current_user.id, task_id):
        raise HTTPException(status_code=404, detail="Task not found")
    return None


@router.post("/{task_id}/toggle", response_model=TaskResponse)
def toggle_task(
    task_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    repo: TaskRepository = Depends(get_task_repository),
):
    updated = repo.toggle(current_user.id, task_id)
    if not updated:
        raise HTTPException(status_code=404, detail="Task not found")
    return updated

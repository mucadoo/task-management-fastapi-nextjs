from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import Optional, Annotated
import uuid
from ..dependencies import CurrentUser, TaskServ
from ..schemas.task import TaskCreate, TaskUpdate, TaskResponse, TaskListResponse
from ..models.task import TaskStatus, TaskPriority
from ..exceptions import NotFoundError

router = APIRouter()


@router.post("/", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(
    task: TaskCreate,
    current_user: CurrentUser,
    service: TaskServ,
):
    return service.create_task(current_user.id, task)


@router.get("/", response_model=TaskListResponse)
def read_tasks(
    current_user: CurrentUser,
    service: TaskServ,
    status: Optional[TaskStatus] = None,
    priority: Optional[TaskPriority] = None,
    q: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    sort_by: str = Query(
        "created_at", pattern="^(created_at|due_date|priority|title)$"
    ),
    sort_dir: str = Query("desc", pattern="^(asc|desc)$"),
):
    items, total = service.get_tasks(
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
    current_user: CurrentUser,
    service: TaskServ,
):
    task = service.get_task(current_user.id, task_id)
    if not task:
        raise NotFoundError("errors.task_not_found")
    return task


@router.put("/{task_id}", response_model=TaskResponse)
def update_task(
    task_id: uuid.UUID,
    task: TaskUpdate,
    current_user: CurrentUser,
    service: TaskServ,
):
    updated = service.update_task(current_user.id, task_id, task)
    if not updated:
        raise NotFoundError("errors.task_not_found")
    return updated


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    task_id: uuid.UUID,
    current_user: CurrentUser,
    service: TaskServ,
):
    if not service.delete_task(current_user.id, task_id):
        raise NotFoundError("errors.task_not_found")
    return None


@router.post("/{task_id}/toggle", response_model=TaskResponse)
def toggle_task(
    task_id: uuid.UUID,
    current_user: CurrentUser,
    service: TaskServ,
):
    updated = service.toggle_task(current_user.id, task_id)
    if not updated:
        raise NotFoundError("errors.task_not_found")
    return updated

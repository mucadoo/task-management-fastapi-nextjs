from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
import datetime
import uuid
from ..models.task import TaskStatus, TaskPriority
class TaskBase(BaseModel):
    title: str = Field(..., min_length=1)
    description: Optional[str] = None
    status: TaskStatus = TaskStatus.PENDING
    priority: TaskPriority = TaskPriority.MEDIUM
    due_date: Optional[datetime.datetime] = None
    due_date_has_time: bool = False
class TaskCreate(TaskBase):
    pass
class TaskResponse(TaskBase):
    id: uuid.UUID
    created_at: datetime.datetime
    model_config = ConfigDict(from_attributes=True)
class TaskListResponse(BaseModel):
    items: List[TaskResponse]
    total: int
    page: int
    page_size: int

from pydantic import BaseModel, Field, ConfigDict, field_validator
from typing import Optional, List
import datetime
import uuid
from ..models.task import TaskStatus, TaskPriority
from .common import PaginatedResponse, BaseResponseSchema, TimestampSchema


class TaskBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=1000)
    status: TaskStatus = TaskStatus.PENDING
    priority: TaskPriority = TaskPriority.MEDIUM
    due_date: Optional[datetime.datetime] = None
    due_date_has_time: bool = False


class TaskCreate(TaskBase):
    @field_validator("due_date")
    @classmethod
    def validate_due_date(
        cls, v: Optional[datetime.datetime]
    ) -> Optional[datetime.datetime]:
        if v:
            if v.tzinfo is None:
                v = v.replace(tzinfo=datetime.timezone.utc)
            if v < datetime.datetime.now(datetime.timezone.utc):
                raise ValueError("Due date cannot be in the past")
        return v


class TaskUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=1000)
    status: Optional[TaskStatus] = None
    priority: Optional[TaskPriority] = None
    due_date: Optional[datetime.datetime] = None
    due_date_has_time: Optional[bool] = None


class TaskResponse(BaseResponseSchema, TaskBase, TimestampSchema):
    id: uuid.UUID


class TaskListResponse(PaginatedResponse[TaskResponse]):
    pass

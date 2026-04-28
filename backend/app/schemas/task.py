from pydantic import BaseModel, Field, ConfigDict, field_validator
from typing import Optional
import datetime
import uuid
from ..models.task import TaskStatus, TaskPriority
from .common import PaginatedResponse, BaseResponseSchema, TimestampSchema


class TaskBase(BaseModel):
    title: str = Field(
        ...,
        min_length=1,
        max_length=100,
        description="The title of the task",
        example="Buy groceries",
    )
    description: Optional[str] = Field(
        None,
        max_length=1000,
        description="A detailed description of the task",
        example="Milk, eggs, and bread",
    )
    status: TaskStatus = Field(
        TaskStatus.PENDING, description="The current status of the task"
    )
    priority: TaskPriority = Field(
        TaskPriority.MEDIUM, description="The priority level of the task"
    )
    due_date: Optional[datetime.datetime] = Field(
        None, description="The date and time when the task is due"
    )
    due_date_has_time: bool = Field(
        False, description="Whether the due date includes a specific time"
    )

    model_config = ConfigDict(
        str_strip_whitespace=True,
        from_attributes=True
    )


class TaskCreate(TaskBase):
    @field_validator("due_date")
    @classmethod
    def validate_due_date(
        cls, v: Optional[datetime.datetime]
    ) -> Optional[datetime.datetime]:
        if v:
            if v.tzinfo is None:
                v = v.replace(tzinfo=datetime.timezone.utc)
            
            
        return v


class TaskUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=100, description="Updated title of the task")
    description: Optional[str] = Field(None, max_length=1000, description="Updated description of the task")
    status: Optional[TaskStatus] = Field(None, description="Updated status")
    priority: Optional[TaskPriority] = Field(None, description="Updated priority")
    due_date: Optional[datetime.datetime] = Field(None, description="Updated due date")
    due_date_has_time: Optional[bool] = Field(None, description="Whether updated due date includes time")

    model_config = ConfigDict(
        str_strip_whitespace=True,
        from_attributes=True
    )


class TaskStatusUpdate(BaseModel):
    status: TaskStatus = Field(..., description="The new status of the task")


class TaskResponse(BaseResponseSchema, TaskBase, TimestampSchema):
    id: uuid.UUID = Field(..., description="Unique task identifier")


class TaskListResponse(PaginatedResponse[TaskResponse]):
    pass

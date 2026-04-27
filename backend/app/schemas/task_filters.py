from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field

from ..models.task import TaskStatus, TaskPriority

class SortOrder(str, Enum):
    ASC = "asc"
    DESC = "desc"

class TaskSortBy(str, Enum):
    CREATED_AT = "created_at"
    DUE_DATE = "due_date"
    PRIORITY = "priority"
    TITLE = "title"

class TaskFilterParams(BaseModel):
    status: Optional[TaskStatus] = Field(None, description="Filter by task status")
    priority: Optional[TaskPriority] = Field(None, description="Filter by task priority")
    q: Optional[str] = Field(None, description="Search query for title and description")
    page: int = Field(1, ge=1, description="Page number")
    page_size: int = Field(10, ge=1, le=100, description="Tasks per page")
    sort_by: TaskSortBy = Field(TaskSortBy.CREATED_AT, description="Field to sort by")
    sort_dir: SortOrder = Field(SortOrder.DESC, description="Sort direction")

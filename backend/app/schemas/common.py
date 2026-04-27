from typing import Generic, List, TypeVar, Optional, Any
import datetime
from pydantic import BaseModel, ConfigDict

T = TypeVar("T")


class BaseResponseSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class TimestampSchema(BaseModel):
    created_at: datetime.datetime
    updated_at: Optional[datetime.datetime] = None


class PaginatedResponse(BaseModel, Generic[T]):
    items: List[T]
    total: int
    page: int
    page_size: int


class ErrorResponse(BaseModel):
    error: str
    detail: Optional[Any] = None
    code: Optional[str] = None

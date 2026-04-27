from typing import Generic, List, TypeVar, Optional, Any
from pydantic import BaseModel, ConfigDict

T = TypeVar("T")


class BaseResponseSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class PaginatedResponse(BaseModel, Generic[T]):
    items: List[T]
    total: int
    page: int
    page_size: int


class ErrorResponse(BaseModel):
    error: str
    detail: Optional[Any] = None
    code: Optional[str] = None

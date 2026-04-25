from pydantic import BaseModel, EmailStr, ConfigDict, Field
import datetime
import uuid
from typing import Optional

class UserCreate(BaseModel):
    email: EmailStr
    name: Optional[str] = None
    password: str = Field(..., min_length=8)
class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    name: Optional[str] = None
    password: Optional[str] = Field(None, min_length=8)
class UserResponse(BaseModel):
    id: uuid.UUID
    email: EmailStr
    name: Optional[str] = None
    created_at: datetime.datetime
    model_config = ConfigDict(from_attributes=True)
class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class RefreshRequest(BaseModel):
    refresh_token: str
class LoginRequest(BaseModel):
    email: EmailStr
    password: str

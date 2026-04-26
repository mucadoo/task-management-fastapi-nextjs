from pydantic import BaseModel, EmailStr, ConfigDict, Field, field_validator
import datetime
import uuid
import re
from typing import Optional

class UserCreate(BaseModel):
    email: EmailStr
    username: Optional[str] = Field(None, min_length=3)
    name: Optional[str] = None
    password: str = Field(..., min_length=8)

    @field_validator('username')
    @classmethod
    def validate_username(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        if not re.match(r'^[a-zA-Z_]+$', v):
            raise ValueError('Username must contain only letters and underscores')
        return v.lower()

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    username: Optional[str] = Field(None, min_length=3)
    name: Optional[str] = None
    password: Optional[str] = Field(None, min_length=8)

    @field_validator('username')
    @classmethod
    def validate_username(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        if not re.match(r'^[a-zA-Z_]+$', v):
            raise ValueError('Username must contain only letters and underscores')
        return v.lower()

class UserResponse(BaseModel):
    id: uuid.UUID
    email: EmailStr
    username: Optional[str] = None
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

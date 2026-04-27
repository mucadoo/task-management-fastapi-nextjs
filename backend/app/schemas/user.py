from pydantic import BaseModel, EmailStr, ConfigDict, Field, field_validator
import datetime
import uuid
import re
from typing import Optional
from .common import BaseResponseSchema, TimestampSchema


def validate_username_logic(v: Optional[str]) -> Optional[str]:
    if v is None:
        return v
    if not re.match(r"^[a-zA-Z_]+$", v):
        raise ValueError("Username must contain only letters and underscores")
    return v.lower()


def validate_password_logic(v: Optional[str]) -> Optional[str]:
    if v is None:
        return v
    if len(v) < 8:
        raise ValueError("Password must be at least 8 characters")
    return v


class UserCreate(BaseModel):
    email: EmailStr
    username: Optional[str] = Field(None, min_length=3, max_length=30)
    name: Optional[str] = Field(None, max_length=100)
    password: str = Field(..., min_length=8, max_length=128)

    @field_validator("username")
    @classmethod
    def validate_username(cls, v: Optional[str]) -> Optional[str]:
        return validate_username_logic(v)

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        return validate_password_logic(v)


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    username: Optional[str] = Field(None, min_length=3, max_length=30)
    name: Optional[str] = Field(None, max_length=100)
    password: Optional[str] = Field(None, min_length=8, max_length=128)
    current_password: Optional[str] = None

    @field_validator("username")
    @classmethod
    def validate_username(cls, v: Optional[str]) -> Optional[str]:
        return validate_username_logic(v)

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: Optional[str]) -> Optional[str]:
        return validate_password_logic(v)


class UserResponse(BaseResponseSchema, TimestampSchema):
    id: uuid.UUID
    email: EmailStr
    username: Optional[str] = None
    name: Optional[str] = None


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshRequest(BaseModel):
    refresh_token: str


class LoginRequest(BaseModel):
    identifier: str
    password: str

from pydantic import BaseModel, EmailStr, ConfigDict, Field, field_validator
import datetime
import uuid
import re
from typing import Optional


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
    if not re.search(r"[A-Z]", v):
        raise ValueError("Password must contain at least one uppercase letter")
    if not re.search(r"[a-z]", v):
        raise ValueError("Password must contain at least one lowercase letter")
    if not re.search(r"[0-9]", v):
        raise ValueError("Password must contain at least one number")
    if not re.search(r"[^A-Za-z0-9]", v):
        raise ValueError("Password must contain at least one special character")
    return v


class UserCreate(BaseModel):
    email: EmailStr
    username: Optional[str] = Field(None, min_length=3)
    name: Optional[str] = None
    password: str = Field(..., min_length=8)

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
    username: Optional[str] = Field(None, min_length=3)
    name: Optional[str] = None
    password: Optional[str] = Field(None, min_length=8)
    current_password: Optional[str] = None

    @field_validator("username")
    @classmethod
    def validate_username(cls, v: Optional[str]) -> Optional[str]:
        return validate_username_logic(v)

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: Optional[str]) -> Optional[str]:
        return validate_password_logic(v)


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
    identifier: str
    password: str

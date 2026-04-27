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
    email: EmailStr = Field(..., description="User's email address", example="user@example.com")
    username: Optional[str] = Field(
        None, min_length=3, max_length=30, description="Unique username", example="johndoe"
    )
    name: Optional[str] = Field(None, max_length=100, description="User's full name", example="John Doe")
    password: str = Field(..., min_length=8, max_length=128, description="User's password")

    @field_validator("username")
    @classmethod
    def validate_username(cls, v: Optional[str]) -> Optional[str]:
        return validate_username_logic(v)

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        return validate_password_logic(v)


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = Field(None, description="Updated email address")
    username: Optional[str] = Field(None, min_length=3, max_length=30, description="Updated username")
    name: Optional[str] = Field(None, max_length=100, description="Updated full name")
    password: Optional[str] = Field(None, min_length=8, max_length=128, description="New password")
    current_password: Optional[str] = Field(None, description="Current password for verification")

    @field_validator("username")
    @classmethod
    def validate_username(cls, v: Optional[str]) -> Optional[str]:
        return validate_username_logic(v)

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: Optional[str]) -> Optional[str]:
        return validate_password_logic(v)


class UserResponse(BaseResponseSchema, TimestampSchema):
    id: uuid.UUID = Field(..., description="Unique user identifier")
    email: EmailStr = Field(..., description="User's email address")
    username: Optional[str] = Field(None, description="Unique username")
    name: Optional[str] = Field(None, description="User's full name")


class TokenResponse(BaseModel):
    access_token: str = Field(..., description="JWT access token")
    refresh_token: str = Field(..., description="JWT refresh token")
    token_type: str = Field("bearer", description="Token type")


class RefreshRequest(BaseModel):
    refresh_token: str = Field(..., description="The refresh token")


class LoginRequest(BaseModel):
    identifier: str = Field(..., description="Email or username")
    password: str = Field(..., description="User's password")

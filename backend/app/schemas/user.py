from pydantic import BaseModel, EmailStr, ConfigDict, Field
import datetime
class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
class UserResponse(BaseModel):
    id: int
    email: EmailStr
    created_at: datetime.datetime
    model_config = ConfigDict(from_attributes=True)
class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
class LoginRequest(BaseModel):
    email: EmailStr
    password: str

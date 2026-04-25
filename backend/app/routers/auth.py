from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..schemas.user import UserCreate, UserResponse, LoginRequest, TokenResponse
from ..repositories import user_repository
from ..services import auth_service
from ..config import get_settings
router = APIRouter()
settings = get_settings()
@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    if user_repository.get_by_email(db, user_data.email):
        raise HTTPException(status_code=409, detail="Email already registered")
    hashed = auth_service.hash_password(user_data.password)
    return user_repository.create(db, user_data.email, hashed)
@router.post("/login", response_model=TokenResponse)
def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    user = user_repository.get_by_email(db, login_data.email)
    if not user or not auth_service.verify_password(login_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = auth_service.create_access_token(
        {"sub": user.email}, settings.jwt_secret, settings.jwt_expire_minutes
    )
    return {"access_token": token, "token_type": "bearer"}

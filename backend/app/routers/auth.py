from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..schemas.user import UserCreate, UserUpdate, UserResponse, LoginRequest, TokenResponse, RefreshRequest
from ..repositories import user_repository, auth_repository
from ..services import auth_service
from ..config import get_settings
from ..dependencies import get_current_user
from ..models.user import User
from datetime import datetime, timedelta, timezone
router = APIRouter()
settings = get_settings()
def create_user_tokens(db: Session, user: User):
    access_token = auth_service.create_access_token(
        {"sub": user.email}, settings.jwt_secret, settings.jwt_expire_minutes
    )
    refresh_token_str = auth_service.create_refresh_token(
        {"sub": user.email}, settings.jwt_secret, settings.jwt_refresh_expire_days
    )
    expires_at = datetime.now(timezone.utc) + timedelta(days=settings.jwt_refresh_expire_days)
    auth_repository.create_refresh_token(db, user.id, refresh_token_str, expires_at)
    return {
        "access_token": access_token,
        "refresh_token": refresh_token_str,
        "token_type": "bearer"
    }
@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    if user_repository.get_by_email(db, user_data.email):
        raise HTTPException(status_code=409, detail="Email already registered")
    hashed = auth_service.hash_password(user_data.password)
    user = user_repository.create(db, user_data.email, hashed, user_data.name)
    return create_user_tokens(db, user)
@router.post("/login", response_model=TokenResponse)
def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    user = user_repository.get_by_email(db, login_data.email)
    if not user or not auth_service.verify_password(login_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return create_user_tokens(db, user)
@router.post("/refresh", response_model=TokenResponse)
def refresh(refresh_data: RefreshRequest, db: Session = Depends(get_db)):
    db_token = auth_repository.get_refresh_token(db, refresh_data.refresh_token)
    if not db_token or db_token.revoked or db_token.expires_at.replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token")
    user = user_repository.get_by_id(db, db_token.user_id)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    auth_repository.revoke_token(db, db_token.id)
    return create_user_tokens(db, user)
@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user
@router.patch("/me", response_model=UserResponse)
def update_me(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    hashed_password = None
    if user_update.password:
        hashed_password = auth_service.hash_password(user_update.password)
    if user_update.email and user_update.email != current_user.email:
        if user_repository.get_by_email(db, user_update.email):
            raise HTTPException(status_code=409, detail="Email already registered")
    return user_repository.update(
        db,
        current_user,
        name=user_update.name,
        email=user_update.email,
        hashed_password=hashed_password
    )

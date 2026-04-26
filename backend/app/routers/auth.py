from fastapi import APIRouter, Depends, HTTPException, status
from ..schemas.user import (
    UserCreate,
    UserUpdate,
    UserResponse,
    LoginRequest,
    TokenResponse,
    RefreshRequest,
)
from ..repositories.user_repository import UserRepository
from ..repositories.auth_repository import AuthRepository
from ..services import auth_service
from ..config import get_settings
from ..dependencies import get_current_user, get_user_repository, get_auth_repository
from ..models.user import User
from datetime import datetime, timedelta, timezone

router = APIRouter()
settings = get_settings()


def create_user_tokens(
    user: User, auth_repo: AuthRepository, user_repo: UserRepository
):
    access_token = auth_service.create_access_token(
        {"sub": user.email}, settings.jwt_secret, settings.jwt_expire_minutes
    )
    refresh_token_str = auth_service.create_refresh_token(
        {"sub": user.email}, settings.jwt_secret, settings.jwt_refresh_expire_days
    )
    expires_at = datetime.now(timezone.utc) + timedelta(
        days=settings.jwt_refresh_expire_days
    )
    auth_repo.create_refresh_token(user.id, refresh_token_str, expires_at)
    return {
        "access_token": access_token,
        "refresh_token": refresh_token_str,
        "token_type": "bearer",
    }


@router.post(
    "/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED
)
def register(
    user_data: UserCreate,
    user_repo: UserRepository = Depends(get_user_repository),
    auth_repo: AuthRepository = Depends(get_auth_repository),
):
    if user_repo.get_by_email(user_data.email):
        raise HTTPException(status_code=409, detail="Email already registered")
    if user_data.username and user_repo.get_by_username(user_data.username):
        raise HTTPException(status_code=409, detail="Username already taken")
    hashed = auth_service.hash_password(user_data.password)
    user = user_repo.create(
        user_data.email, hashed, user_data.name, user_data.username
    )
    return create_user_tokens(user, auth_repo, user_repo)


@router.post("/login", response_model=TokenResponse)
def login(
    login_data: LoginRequest,
    user_repo: UserRepository = Depends(get_user_repository),
    auth_repo: AuthRepository = Depends(get_auth_repository),
):
    user = user_repo.get_by_email_or_username(login_data.identifier)
    if not user or not auth_service.verify_password(
        login_data.password, user.hashed_password
    ):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return create_user_tokens(user, auth_repo, user_repo)


@router.post("/refresh", response_model=TokenResponse)
def refresh(
    refresh_data: RefreshRequest,
    user_repo: UserRepository = Depends(get_user_repository),
    auth_repo: AuthRepository = Depends(get_auth_repository),
):
    db_token = auth_repo.get_refresh_token(refresh_data.refresh_token)
    if (
        not db_token
        or db_token.revoked
        or db_token.expires_at.replace(tzinfo=timezone.utc) < datetime.now(timezone.utc)
    ):
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token")
    user = user_repo.get_by_id(db_token.user_id)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    auth_repo.revoke_token(db_token.id)
    return create_user_tokens(user, auth_repo, user_repo)


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.patch("/me", response_model=UserResponse)
def update_me(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    user_repo: UserRepository = Depends(get_user_repository),
):
    hashed_password = None
    if user_update.password:
        if not user_update.current_password:
            raise HTTPException(
                status_code=400,
                detail="Current password is required to set a new password",
            )
        if not auth_service.verify_password(
            user_update.current_password, current_user.hashed_password
        ):
            raise HTTPException(status_code=401, detail="Incorrect current password")
        hashed_password = auth_service.hash_password(user_update.password)
    if user_update.email and user_update.email != current_user.email:
        if user_repo.get_by_email(user_update.email):
            raise HTTPException(status_code=409, detail="Email already registered")
    if user_update.username and user_update.username != current_user.username:
        if user_repo.get_by_username(user_update.username):
            raise HTTPException(status_code=409, detail="Username already taken")
    return user_repo.update(
        current_user,
        name=user_update.name,
        email=user_update.email,
        username=user_update.username,
        hashed_password=hashed_password,
    )


@router.get("/check-username")
def check_username(
    username: str, user_repo: UserRepository = Depends(get_user_repository)
):
    username = username.lower()
    user = user_repo.get_by_username(username)
    return {"available": user is None}


@router.get("/check-email")
def check_email(
    email: str, user_repo: UserRepository = Depends(get_user_repository)
):
    email = email.lower()
    user = user_repo.get_by_email(email)
    return {"available": user is None}

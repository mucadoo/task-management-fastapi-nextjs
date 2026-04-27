import uuid
from typing import Optional, TYPE_CHECKING, Any
from passlib.context import CryptContext
from datetime import datetime, timedelta, timezone
from jose import jwt, JWTError
from ..models.user import User
from ..repositories.auth_repository import AuthRepository
from ..repositories.user_repository import UserRepository
from ..exceptions import UnauthorizedError, AppError

if TYPE_CHECKING:
    from ..services.user_service import UserService
    from ..schemas.user import UserUpdate

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class AuthService:
    def __init__(
        self,
        secret: str,
        expire_minutes: int,
        refresh_expire_days: int,
        user_repo: UserRepository,
        auth_repo: AuthRepository,
        user_service: Optional["UserService"] = None,
    ):
        self.secret = secret
        self.expire_minutes = expire_minutes
        self.refresh_expire_days = refresh_expire_days
        self.user_repo = user_repo
        self.auth_repo = auth_repo
        self.user_service = user_service

    def hash_password(self, plain: str) -> str:
        return pwd_context.hash(plain[:72])

    def verify_password(self, plain: str, hashed: str) -> bool:
        return pwd_context.verify(plain[:72], hashed)

    def create_access_token(self, data: dict) -> str:
        to_encode = data.copy()
        expire = datetime.now(timezone.utc) + timedelta(minutes=self.expire_minutes)
        to_encode.update({"exp": expire, "jti": str(uuid.uuid4())})
        return jwt.encode(to_encode, self.secret, algorithm="HS256")

    def create_refresh_token(self, data: dict) -> str:
        to_encode = data.copy()
        expire = datetime.now(timezone.utc) + timedelta(days=self.refresh_expire_days)
        to_encode.update({"exp": expire, "scope": "refresh", "jti": str(uuid.uuid4())})
        return jwt.encode(to_encode, self.secret, algorithm="HS256")

    def decode_token(self, token: str) -> dict | None:
        try:
            return jwt.decode(token, self.secret, algorithms=["HS256"])
        except (JWTError, Exception):
            return None

    def create_user_tokens(self, user: User):
        access_token = self.create_access_token({"sub": user.email})
        refresh_token_str = self.create_refresh_token({"sub": user.email})
        expires_at = datetime.now(timezone.utc) + timedelta(days=self.refresh_expire_days)
        self.auth_repo.create_token(user.id, refresh_token_str, expires_at)
        self.auth_repo.commit()
        return {
            "access_token": access_token,
            "refresh_token": refresh_token_str,
            "token_type": "bearer",
        }

    def register(
        self,
        email: str,
        password: str,
        name: Optional[str],
        username: Optional[str],
    ):
        if not self.user_service:
            raise AppError("UserService not initialized")
            
        hashed = self.hash_password(password)
        user = self.user_service.register_user(email, hashed, name, username)
        return self.create_user_tokens(user)

    def login(
        self,
        identifier: str,
        password: str,
    ):
        user = self.user_repo.get_by_email_or_username(identifier)
        if not user or not self.verify_password(password, user.hashed_password):
            raise UnauthorizedError("errors.invalid_credentials")
        return self.create_user_tokens(user)

    def refresh_tokens(
        self,
        refresh_token: str,
    ):
        db_token = self.auth_repo.get_refresh_token(refresh_token)
        if (
            not db_token
            or db_token.revoked
            or db_token.expires_at.replace(tzinfo=timezone.utc) < datetime.now(timezone.utc)
        ):
            raise UnauthorizedError("errors.expired_refresh_token")

        user = self.user_repo.get_by_id(db_token.user_id)
        if not user:
            raise UnauthorizedError("errors.user_not_found")

        self.auth_repo.revoke_token(db_token.id)
        # We don't commit yet because create_user_tokens will do it
        return self.create_user_tokens(user)

    def prepare_password_update(
        self,
        current_user: User,
        new_password: str,
        current_password: Optional[str],
    ) -> str:
        if not current_password:
            raise AppError("errors.password_required_new", code="BAD_REQUEST")
            
        if not self.verify_password(current_password, current_user.hashed_password):
            raise UnauthorizedError("errors.incorrect_password")
            
        return self.hash_password(new_password)

    def update_user_profile(
        self,
        current_user: User,
        user_update: "UserUpdate",
    ) -> User:
        if not self.user_service:
            raise AppError("UserService not initialized")
            
        update_data = user_update.model_dump(exclude_unset=True)
        
        if "password" in update_data:
            update_data["hashed_password"] = self.prepare_password_update(
                current_user, update_data.pop("password"), user_update.current_password
            )
            update_data.pop("current_password", None)

        return self.user_service.update_user_profile(current_user, update_data)

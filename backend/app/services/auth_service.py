import uuid
from passlib.context import CryptContext
from datetime import datetime, timedelta, timezone
from jose import jwt, JWTError
from ..models.user import User
from ..repositories.auth_repository import AuthRepository

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class AuthService:
    def __init__(self, secret: str, expire_minutes: int, refresh_expire_days: int):
        self.secret = secret
        self.expire_minutes = expire_minutes
        self.refresh_expire_days = refresh_expire_days

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

    def create_user_tokens(self, user: User, auth_repo: AuthRepository):
        access_token = self.create_access_token({"sub": user.email})
        refresh_token_str = self.create_refresh_token({"sub": user.email})
        expires_at = datetime.now(timezone.utc) + timedelta(days=self.refresh_expire_days)
        auth_repo.create_token(user.id, refresh_token_str, expires_at)
        auth_repo.db.commit()
        return {
            "access_token": access_token,
            "refresh_token": refresh_token_str,
            "token_type": "bearer",
        }

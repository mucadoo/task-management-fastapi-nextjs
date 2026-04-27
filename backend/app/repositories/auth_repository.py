import uuid
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from .base_repository import BaseRepository
from ..models.auth import RefreshToken
from typing import Optional


class AuthRepository(BaseRepository[RefreshToken]):
    def __init__(self, db: Session):
        super().__init__(RefreshToken, db)

    def create_token(
        self, user_id: uuid.UUID, token: str, expires_at: datetime
    ) -> RefreshToken:
        return super().create({
            "user_id": user_id,
            "token": token,
            "expires_at": expires_at
        })

    def get_refresh_token(self, token: str) -> Optional[RefreshToken]:
        return self.db.query(RefreshToken).filter(RefreshToken.token == token).first()

    def revoke_token(self, token_id: uuid.UUID):
        db_token = self.get_by_id(token_id)
        if db_token:
            db_token.revoked = True

    def revoke_all_user_tokens(self, user_id: uuid.UUID):
        self.db.query(RefreshToken).filter(
            RefreshToken.user_id == user_id, RefreshToken.revoked.is_(False)
        ).update({RefreshToken.revoked: True})

    def cleanup_expired_tokens(self):
        now = datetime.now(timezone.utc)
        self.db.query(RefreshToken).filter(RefreshToken.expires_at < now).delete()

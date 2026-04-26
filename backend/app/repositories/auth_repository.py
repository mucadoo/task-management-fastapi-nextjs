import uuid
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from ..models.auth import RefreshToken
from typing import Optional


class AuthRepository:
    def __init__(self, db: Session):
        self.db = db

    def create_refresh_token(
        self, user_id: uuid.UUID, token: str, expires_at: datetime
    ) -> RefreshToken:
        db_token = RefreshToken(user_id=user_id, token=token, expires_at=expires_at)
        self.db.add(db_token)
        self.db.commit()
        self.db.refresh(db_token)
        return db_token

    def get_refresh_token(self, token: str) -> Optional[RefreshToken]:
        return self.db.query(RefreshToken).filter(RefreshToken.token == token).first()

    def revoke_token(self, token_id: uuid.UUID):
        db_token = (
            self.db.query(RefreshToken).filter(RefreshToken.id == token_id).first()
        )
        if db_token:
            db_token.revoked = True
            self.db.commit()

    def revoke_all_user_tokens(self, user_id: uuid.UUID):
        self.db.query(RefreshToken).filter(
            RefreshToken.user_id == user_id, RefreshToken.revoked == False
        ).update({RefreshToken.revoked: True})
        self.db.commit()

    def cleanup_expired_tokens(self):
        now = datetime.now(timezone.utc)
        self.db.query(RefreshToken).filter(RefreshToken.expires_at < now).delete()
        self.db.commit()

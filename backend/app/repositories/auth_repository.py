import uuid
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from ..models.auth import RefreshToken
from typing import Optional

def create_refresh_token(db: Session, user_id: uuid.UUID, token: str, expires_at: datetime) -> RefreshToken:
    db_token = RefreshToken(
        user_id=user_id,
        token=token,
        expires_at=expires_at
    )
    db.add(db_token)
    db.commit()
    db.refresh(db_token)
    return db_token

def get_refresh_token(db: Session, token: str) -> Optional[RefreshToken]:
    return db.query(RefreshToken).filter(RefreshToken.token == token).first()

def revoke_token(db: Session, token_id: uuid.UUID):
    db_token = db.query(RefreshToken).filter(RefreshToken.id == token_id).first()
    if db_token:
        db_token.revoked = True
        db.commit()

def revoke_all_user_tokens(db: Session, user_id: uuid.UUID):
    db.query(RefreshToken).filter(
        RefreshToken.user_id == user_id,
        RefreshToken.revoked == False
    ).update({RefreshToken.revoked: True})
    db.commit()

def cleanup_expired_tokens(db: Session):
    now = datetime.now(timezone.utc)
    db.query(RefreshToken).filter(
        RefreshToken.expires_at < now
    ).delete()
    db.commit()

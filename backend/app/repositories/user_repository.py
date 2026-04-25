from sqlalchemy.orm import Session
from ..models.user import User
from typing import Optional
def get_by_email(db: Session, email: str) -> Optional[User]:
    return db.query(User).filter(User.email == email).first()
def create(db: Session, email: str, hashed_password: str) -> User:
    db_user = User(email=email, hashed_password=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

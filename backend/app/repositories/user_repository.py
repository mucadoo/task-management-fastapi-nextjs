import uuid
from sqlalchemy.orm import Session
from ..models.user import User
from typing import Optional

def get_by_id(db: Session, user_id: uuid.UUID) -> Optional[User]:
    return db.query(User).filter(User.id == user_id).first()

def get_by_email(db: Session, email: str) -> Optional[User]:
    return db.query(User).filter(User.email == email).first()
def create(db: Session, email: str, hashed_password: str, name: Optional[str] = None) -> User:
    db_user = User(email=email, hashed_password=hashed_password, name=name)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user
def update(db: Session, user: User, name: Optional[str] = None, email: Optional[str] = None, hashed_password: Optional[str] = None) -> User:
    if name is not None:
        user.name = name
    if email is not None:
        user.email = email
    if hashed_password is not None:
        user.hashed_password = hashed_password
    db.commit()
    db.refresh(user)
    return user

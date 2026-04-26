import uuid
from sqlalchemy.orm import Session
from ..models.user import User
from typing import Optional


class UserRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, user_id: uuid.UUID) -> Optional[User]:
        return self.db.query(User).filter(User.id == user_id).first()

    def get_by_email(self, email: str) -> Optional[User]:
        return self.db.query(User).filter(User.email == email).first()

    def get_by_username(self, username: str) -> Optional[User]:
        return self.db.query(User).filter(User.username == username).first()

    def get_by_email_or_username(self, identifier: str) -> Optional[User]:
        from sqlalchemy import or_

        identifier_lower = identifier.lower()
        return (
            self.db.query(User)
            .filter(
                or_(User.email == identifier_lower, User.username == identifier_lower)
            )
            .first()
        )

    def create(
        self,
        email: str,
        hashed_password: str,
        name: Optional[str] = None,
        username: Optional[str] = None,
    ) -> User:
        db_user = User(
            email=email, hashed_password=hashed_password, name=name, username=username
        )
        self.db.add(db_user)
        self.db.commit()
        self.db.refresh(db_user)
        return db_user

    def update(
        self,
        user: User,
        name: Optional[str] = None,
        email: Optional[str] = None,
        hashed_password: Optional[str] = None,
        username: Optional[str] = None,
    ) -> User:
        if name is not None:
            user.name = name
        if email is not None:
            user.email = email
        if username is not None:
            user.username = username
        if hashed_password is not None:
            user.hashed_password = hashed_password
        self.db.commit()
        self.db.refresh(user)
        return user

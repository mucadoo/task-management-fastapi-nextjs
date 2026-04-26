import uuid
from sqlalchemy.orm import Session
from typing import Optional
from .base_repository import BaseRepository
from ..models.user import User


class UserRepository(BaseRepository[User]):
    def __init__(self, db: Session):
        super().__init__(User, db)

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

    def create_user(
        self,
        email: str,
        hashed_password: str,
        name: Optional[str] = None,
        username: Optional[str] = None,
    ) -> User:
        return super().create({
            "email": email,
            "hashed_password": hashed_password,
            "name": name,
            "username": username
        })

    def update_user(self, user: User, update_data: dict) -> User:
        return super().update(user, update_data)

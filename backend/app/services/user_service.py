import uuid
from typing import Optional, Dict, Any
from ..repositories.user_repository import UserRepository
from ..models.user import User
from ..exceptions import ConflictError, UnauthorizedError

class UserService:
    def __init__(self, user_repo: UserRepository):
        self.user_repo = user_repo

    def get_user_by_id(self, user_id: uuid.UUID) -> Optional[User]:
        return self.user_repo.get_by_id(user_id)

    def get_user_by_email(self, email: str) -> Optional[User]:
        return self.user_repo.get_by_email(email)

    def get_user_by_username(self, username: str) -> Optional[User]:
        return self.user_repo.get_by_username(username)

    def get_user_by_email_or_username(self, identifier: str) -> Optional[User]:
        return self.user_repo.get_by_email_or_username(identifier)

    def register_user(
        self, email: str, hashed_password: str, name: Optional[str] = None, username: Optional[str] = None
    ) -> User:
        if self.user_repo.get_by_email(email):
            raise ConflictError("errors.email_registered")
        if username and self.user_repo.get_by_username(username):
            raise ConflictError("errors.username_taken")
            
        user = self.user_repo.create_user(email, hashed_password, name, username)
        self.user_repo.db.commit()
        self.user_repo.db.refresh(user)
        return user

    def update_user_profile(self, user: User, update_data: Dict[str, Any]) -> User:
        email = update_data.get("email")
        if email and email != user.email:
            if self.user_repo.get_by_email(email):
                raise ConflictError("errors.email_registered")
                
        username = update_data.get("username")
        if username and username != user.username:
            if self.user_repo.get_by_username(username):
                raise ConflictError("errors.username_taken")
                
        updated_user = self.user_repo.update_user(user, update_data)
        self.user_repo.db.commit()
        self.user_repo.db.refresh(updated_user)
        return updated_user

    def is_username_available(self, username: str) -> bool:
        return self.user_repo.get_by_username(username.lower()) is None

    def is_email_available(self, email: str) -> bool:
        return self.user_repo.get_by_email(email.lower()) is None

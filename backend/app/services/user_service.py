import uuid
from typing import Optional, Dict, Any
from ..repositories.user_repository import UserRepository
from ..models.user import User
from ..exceptions import ConflictError, BusinessError

from .base_service import BaseService

class UserService(BaseService[User, UserRepository]):
    def __init__(self, user_repo: UserRepository):
        super().__init__(user_repo, "user")

    def get_user_by_id(self, user_id: uuid.UUID) -> Optional[User]:
        return self.get_by_id_or_404(user_id)

    def get_user_by_email(self, email: str) -> Optional[User]:
        return self.repository.get_by_email(email.lower())

    def get_user_by_username(self, username: str) -> Optional[User]:
        return self.repository.get_by_username(username.lower())

    def get_user_by_email_or_username(self, identifier: str) -> Optional[User]:
        return self.repository.get_by_email_or_username(identifier)

    def register_user(
        self, email: str, hashed_password: str, name: Optional[str] = None, username: str = None
    ) -> User:
        safe_email = email.lower()
        
        if not username or username.strip() == "":
            raise BusinessError("errors.username_required")
            
        safe_username = username.lower()
        
        if self.repository.get_by_email(safe_email):
            raise ConflictError("errors.email_registered")
        if self.repository.get_by_username(safe_username):
            raise ConflictError("errors.username_taken")
            
        user = self.repository.create_user(safe_email, hashed_password, name, safe_username)
        return self.repository.commit_and_refresh(user)

    def update_user_profile(self, user: User, update_data: Dict[str, Any]) -> User:
        if "email" in update_data:
            update_data["email"] = update_data["email"].lower()
            email = update_data["email"]
            if email != user.email:
                if self.repository.get_by_email(email):
                    raise ConflictError("errors.email_registered")
                
        if "username" in update_data:
            new_username = update_data["username"]
            if not new_username or str(new_username).strip() == "":
                raise BusinessError("errors.username_required")
                
            update_data["username"] = new_username.lower()
            username = update_data["username"]
            if username != user.username:
                if self.repository.get_by_username(username):
                    raise ConflictError("errors.username_taken")
                
        updated_user = self.repository.update_user(user, update_data)
        return self.repository.commit_and_refresh(updated_user)

    def is_username_available(self, username: str) -> bool:
        return self.repository.get_by_username(username.lower()) is None

    def is_email_available(self, email: str) -> bool:
        return self.repository.get_by_email(email.lower()) is None

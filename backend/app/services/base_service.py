from typing import TypeVar, Generic, Optional, Any
import uuid
from ..repositories.base_repository import BaseRepository
from ..exceptions import NotFoundError

T = TypeVar("T")
R = TypeVar("R", bound=BaseRepository)

class BaseService(Generic[T, R]):
    def __init__(self, repository: R, resource_name: str = "resource"):
        self.repository = repository
        self.resource_name = resource_name

    def get_by_id_or_404(self, id: uuid.UUID) -> T:
        resource = self.repository.get_by_id(id)
        if not resource:
            raise NotFoundError(f"errors.{self.resource_name}_not_found")
        return resource

    def get_or_404(self, owner_id: uuid.UUID, id: uuid.UUID) -> T:
        resource = self.repository.get_by_id_scoped(id, owner_id)
        if not resource:
            raise NotFoundError(f"errors.{self.resource_name}_not_found")
        return resource

    def create_resource_with_commit(self, data: Any) -> T:
        dumped_data = data.model_dump() if hasattr(data, "model_dump") else data
        resource = self.repository.create(dumped_data)
        return self.repository.commit_and_refresh(resource)

    def create_with_commit(self, owner_id: uuid.UUID, data: Any) -> T:
        resource = self.repository.create_with_owner(owner_id, data)
        return self.repository.commit_and_refresh(resource)

    def update_resource_with_commit(self, id: uuid.UUID, data: Any) -> T:
        resource = self.get_by_id_or_404(id)
        updated_resource = self.repository.update(resource, data)
        return self.repository.commit_and_refresh(updated_resource)

    def update_with_commit(self, owner_id: uuid.UUID, id: uuid.UUID, data: Any) -> T:
        resource = self.repository.update_scoped(id, owner_id, data)
        if not resource:
            raise NotFoundError(f"errors.{self.resource_name}_not_found")
        return self.repository.commit_and_refresh(resource)

    def delete_resource_with_commit(self, id: uuid.UUID) -> bool:
        resource = self.get_by_id_or_404(id)
        self.repository.db.delete(resource)
        self.repository.commit()
        return True

    def delete_with_commit(self, owner_id: uuid.UUID, id: uuid.UUID) -> bool:
        success = self.repository.delete_scoped(id, owner_id)
        if not success:
            raise NotFoundError(f"errors.{self.resource_name}_not_found")
        self.repository.commit()
        return True

import uuid
from typing import Generic, List, Optional, Type, TypeVar
from sqlalchemy.orm import Session
from ..database import Base

ModelType = TypeVar("ModelType", bound=Base)

class BaseRepository(Generic[ModelType]):
    def __init__(self, model: Type[ModelType], db: Session):
        self.model = model
        self.db = db

    def get_by_id(self, id: uuid.UUID) -> Optional[ModelType]:
        return self.db.query(self.model).filter(self.model.id == id).first()

    def get_by_id_scoped(self, id: uuid.UUID, owner_id: uuid.UUID) -> Optional[ModelType]:
        return (
            self.db.query(self.model)
            .filter(self.model.id == id, self.model.owner_id == owner_id)
            .first()
        )

    def get_multi(self, skip: int = 0, limit: int = 100) -> List[ModelType]:
        return self.db.query(self.model).offset(skip).limit(limit).all()

    def get_multi_scoped(
        self, owner_id: uuid.UUID, skip: int = 0, limit: int = 100
    ) -> List[ModelType]:
        return (
            self.db.query(self.model)
            .filter(self.model.owner_id == owner_id)
            .offset(skip)
            .limit(limit)
            .all()
        )

    def create(self, obj_in: dict) -> ModelType:
        db_obj = self.model(**obj_in)
        self.db.add(db_obj)
        return db_obj

    def update(self, db_obj: ModelType, obj_in: dict) -> ModelType:
        for field in obj_in:
            if hasattr(db_obj, field):
                setattr(db_obj, field, obj_in[field])
        return db_obj

    def delete(self, id: uuid.UUID) -> bool:
        obj = self.get_by_id(id)
        if not obj:
            return False
        self.db.delete(obj)
        return True

    def delete_scoped(self, id: uuid.UUID, owner_id: uuid.UUID) -> bool:
        obj = self.get_by_id_scoped(id, owner_id)
        if not obj:
            return False
        self.db.delete(obj)
        return True

    def commit_and_refresh(self, model: ModelType) -> ModelType:
        self.db.commit()
        self.db.refresh(model)
        return model

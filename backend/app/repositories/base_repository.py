import uuid
from typing import Generic, List, Optional, Type, TypeVar, Any
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

    def create_with_owner(self, owner_id: uuid.UUID, obj_in: Any) -> ModelType:
        data = obj_in.model_dump() if hasattr(obj_in, "model_dump") else obj_in
        return self.create({**data, "owner_id": owner_id})

    def update(self, db_obj: ModelType, obj_in: Any) -> ModelType:
        data = (
            obj_in.model_dump(exclude_unset=True)
            if hasattr(obj_in, "model_dump")
            else obj_in
        )
        for field in data:
            if hasattr(db_obj, field):
                setattr(db_obj, field, data[field])
        return db_obj

    def update_scoped(
        self, id: uuid.UUID, owner_id: uuid.UUID, obj_in: Any
    ) -> Optional[ModelType]:
        db_obj = self.get_by_id_scoped(id, owner_id)
        if not db_obj:
            return None
        return self.update(db_obj, obj_in)

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
        self.commit()
        self.db.refresh(model)
        return model

    def commit(self) -> None:
        self.db.commit()

    def apply_sorting(self, query, sort_by: str, sort_dir: str):
        sort_col = getattr(self.model, sort_by, None)
        if sort_col is None:
            # Fallback to id if the field doesn't exist on the model
            sort_col = getattr(self.model, "id")
            
        if sort_dir == "asc":
            return query.order_by(sort_col.asc().nulls_last())
        return query.order_by(sort_col.desc().nulls_last())

    def paginate(self, query, page: int, page_size: int):
        total = query.count()
        items = query.offset((page - 1) * page_size).limit(page_size).all()
        return {
            "items": items,
            "total": total,
            "page": page,
            "page_size": page_size,
        }

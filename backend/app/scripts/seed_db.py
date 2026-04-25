import sys
import os
import random
from faker import Faker

sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from app.database import SessionLocal, engine
from app.models.user import User
from app.models.task import Task, TaskStatus, TaskPriority
from app.services import auth_service

fake = Faker()

def seed_db():
    print(f"Using database: {engine.url}")
    db = SessionLocal()
    try:
        print("Seeding users...")
        default_users = [
            ("Developer", "dev@example.com", "password123"),
            ("Tester", "tester@example.com", "password123"),
            ("Manager", "manager@example.com", "password123"),
        ]
        
        for name, email, password in default_users:
            if not db.query(User).filter(User.email == email).first():
                user = User(
                    name=name,
                    email=email,
                    hashed_password=auth_service.hash_password(password)
                )
                db.add(user)
        
        for _ in range(2):
            email = fake.email()
            if not db.query(User).filter(User.email == email).first():
                user = User(
                    name=fake.name(),
                    email=email,
                    hashed_password=auth_service.hash_password("password123")
                )
                db.add(user)
        
        db.commit()
            
        print(f"Total users: {db.query(User).count()}")
        
        print("Seeding tasks...")
        all_users = db.query(User).all()
        for user in all_users:
            num_tasks = random.randint(10, 15)
            for _ in range(num_tasks):
                task = Task(
                    title=fake.sentence(nb_words=4),
                    description=fake.paragraph(nb_sentences=2),
                    status=random.choice(list(TaskStatus)),
                    priority=random.choice(list(TaskPriority)),
                    owner_id=user.id,
                    created_at=fake.date_time_between(start_date="-30d", end_date="now")
                )
                db.add(task)
        
        db.commit()
        print(f"Total tasks: {db.query(Task).count()}")
        print("Seeding completed successfully!")
        
    except Exception as e:
        print(f"An error occurred: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()

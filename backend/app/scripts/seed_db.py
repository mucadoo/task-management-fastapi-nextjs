import sys
import os
import random
import datetime
from faker import Faker

sys.path.append(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
)
from app.database import SessionLocal, engine
from app.models.user import User
from app.models.task import Task, TaskStatus, TaskPriority
from app.utils.security import hash_password

fake = Faker("pt_BR")


def seed_db():
    print(f"Using database: {engine.url}")
    db = SessionLocal()
    try:
        print("Seeding users...")
        default_users = [
            ("Desenvolvedor", "dev@exemplo.com", "dev", "senha123"),
            ("Testador", "tester@exemplo.com", "tester", "senha123"),
            ("Gerente", "gerente@exemplo.com", "gerente", "senha123"),
        ]
        for name, email, username, password in default_users:
            if not db.query(User).filter(User.email == email).first():
                user = User(
                    name=name,
                    email=email,
                    username=username,
                    hashed_password=hash_password(password),
                )
                db.add(user)
        db.commit()
        print(f"Total users: {db.query(User).count()}")
        print("Seeding tasks...")
        pt_task_words = [
            "Implementar",
            "Corrigir",
            "Revisar",
            "Testar",
            "Documentar",
            "Refatorar",
            "Otimizar",
            "Atualizar",
            "Configurar",
            "Lançar",
            "funcionalidade",
            "bug",
            "erro",
            "interface",
            "banco de dados",
            "API",
            "frontend",
            "backend",
            "sistema",
            "usuário",
            "segurança",
            "performance",
            "componente",
            "módulo",
            "script",
            "design",
            "layout",
            "estilo",
            "código",
            "requisito",
            "projeto",
            "tarefa",
            "ajuste",
            "melhoria",
        ]
        all_users = db.query(User).all()
        for user in all_users:
            num_tasks = random.randint(20, 30)
            for _ in range(num_tasks):
                due_date = None
                due_date_has_time = False
                if random.random() > 0.3:
                    days_offset = random.randint(-7, 14)
                    due_date = datetime.datetime.now(
                        datetime.timezone.utc
                    ) + datetime.timedelta(days=days_offset)
                    if random.random() > 0.5:
                        due_date_has_time = True
                        random_hour = random.randint(0, 23)
                        random_minute = random.randint(0, 59)
                        due_date = due_date.replace(
                            hour=random_hour,
                            minute=random_minute,
                            second=0,
                            microsecond=0,
                        )
                    else:
                        due_date = due_date.replace(
                            hour=0, minute=0, second=0, microsecond=0
                        )
                task = Task(
                    title=fake.sentence(
                        nb_words=random.randint(3, 5), ext_word_list=pt_task_words
                    ).rstrip("."),
                    description=fake.paragraph(
                        nb_sentences=2, ext_word_list=pt_task_words
                    )
                    if random.random() > 0.2
                    else None,
                    status=random.choice(list(TaskStatus)),
                    priority=random.choice(list(TaskPriority)),
                    due_date=due_date,
                    due_date_has_time=due_date_has_time,
                    owner_id=user.id,
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

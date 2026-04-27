from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import tasks, auth, logic, health
from .config import get_settings
from .exception_handlers import register_exception_handlers

settings = get_settings()
app = FastAPI(
    title="Task Management API",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

register_exception_handlers(app)


app.include_router(health.router, prefix="/api", tags=["health"])
app.include_router(tasks.router, prefix="/api/v1/tasks", tags=["tasks"])
app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(logic.router, prefix="/api/v1", tags=["logic"])

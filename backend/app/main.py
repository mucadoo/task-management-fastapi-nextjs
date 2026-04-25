from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from .routers import tasks, auth, misc
from .config import get_settings
settings = get_settings()
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": exc.detail},
    )
@app.get("/api/health")
async def health_check():
    return {"status": "ok", "version": "1.0.0"}
app.include_router(tasks.router, prefix="/api/tasks", tags=["tasks"])
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(misc.router, prefix="/api", tags=["misc"])

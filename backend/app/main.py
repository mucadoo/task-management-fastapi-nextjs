from fastapi import FastAPI, Request, HTTPException, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from .routers import tasks, auth, logic
from .config import get_settings
from .schemas.common import ErrorResponse

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


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content=ErrorResponse(error=str(exc.detail)).model_dump(),
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = []
    for error in exc.errors():
        field = error["loc"][-1] if error["loc"] else "unknown"
        errors.append({"field": str(field), "message": error["msg"]})

    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content=ErrorResponse(
            error="Validation failed",
            detail=errors,
            code="VALIDATION_ERROR"
        ).model_dump(),
    )


@app.get("/api/v1/health")
@app.get("/api/health")  # Keep legacy for compatibility
async def health_check():
    return {"status": "ok", "version": "1.0.0"}


app.include_router(tasks.router, prefix="/api/v1/tasks", tags=["tasks"])
app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(logic.router, prefix="/api/v1", tags=["logic"])

from fastapi import Request, HTTPException, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from .schemas.common import ErrorResponse
from .exceptions import AppError

def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content=ErrorResponse(error=str(exc.detail)).model_dump(),
    )

def app_error_handler(request: Request, exc: AppError):
    status_code = getattr(exc, "status_code", 400)
    return JSONResponse(
        status_code=status_code,
        content=ErrorResponse(
            error=exc.message,
            detail=exc.detail,
            code=exc.code
        ).model_dump(),
    )

def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = []
    for error in exc.errors():
        field = error["loc"][-1] if error["loc"] else "unknown"
        errors.append({"field": str(field), "message": error["msg"]})

    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content=ErrorResponse(
            error="errors.validation_failed",
            detail=errors,
            code="VALIDATION_ERROR"
        ).model_dump(),
    )

def register_exception_handlers(app):
    app.add_exception_handler(HTTPException, http_exception_handler)
    app.add_exception_handler(AppError, app_error_handler)
    app.add_exception_handler(RequestValidationError, validation_exception_handler)

from typing import Any, Optional

class AppError(Exception):
    def __init__(self, message: str, code: str = "INTERNAL_ERROR", detail: Optional[Any] = None):
        self.message = message
        self.code = code
        self.detail = detail
        super().__init__(self.message)

class BusinessError(AppError):
    status_code = 400

class ValidationError(BusinessError):
    status_code = 422
    def __init__(self, message: str, detail: Optional[Any] = None):
        super().__init__(message, code="VALIDATION_ERROR", detail=detail)

class NotFoundError(BusinessError):
    status_code = 404
    def __init__(self, message: str):
        super().__init__(message, code="NOT_FOUND")

class UnauthorizedError(BusinessError):
    status_code = 401
    def __init__(self, message: str):
        super().__init__(message, code="UNAUTHORIZED")

class ConflictError(BusinessError):
    status_code = 409
    def __init__(self, message: str):
        super().__init__(message, code="CONFLICT")

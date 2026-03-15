from fastapi import Request, HTTPException, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
import logging

logger = logging.getLogger(__name__)

async def global_exception_handler(request: Request, exc: Exception):
    """Catch-all for any unhandled server errors."""
    logger.error(f"Unhandled error: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "Internal Server Error",
            "message": "An unexpected error occurred. Please try again later.",
            "code": "INTERNAL_ERROR"
        },
    )

async def http_exception_handler(request: Request, exc: HTTPException):
    """Standardized handler for FastAPI HTTP exceptions."""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.detail if isinstance(exc.detail, str) else "Error",
            "message": exc.detail if isinstance(exc.detail, str) else str(exc.detail),
            "code": f"HTTP_{exc.status_code}"
        },
    )

async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Custom handler for Pydantic validation errors."""
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": "Validation Error",
            "message": "The request data is invalid.",
            "details": exc.errors(),
            "code": "VALIDATION_ERROR"
        },
    )

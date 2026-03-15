from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError, HTTPException
from fastapi.staticfiles import StaticFiles
import os
from app.api.exception_handlers import (
    global_exception_handler,
    http_exception_handler,
    validation_exception_handler,
)
from app.core.dependencies import limiter
from slowapi.errors import RateLimitExceeded
from slowapi import _rate_limit_exceeded_handler
from app.core.logging_config import setup_logging
from app.core.socket_manager import socket_manager

# Initialize Logging
setup_logging()

from app.core.config import settings

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Run migrations and seed data at startup."""
    from app.db.alembic_utils import run_upgrade
    from app.db.database import SessionLocal
    from app.db.init_db import init_db
    print("Starting database migrations...", flush=True)
    run_upgrade()
    print("Migrations complete. Initializing database...", flush=True)
    try:
        with SessionLocal() as db:
            init_db(db)
        print("Database initialization complete.", flush=True)
    except Exception as e:
        print(f"Error during initialization: {e}", flush=True)
    
    yield

from app.api.middleware.security_headers import SecurityHeadersMiddleware

# Create app and register CORS FIRST — before any imports that could fail
app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan
)

# Rate limiting state
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Security Headers Middleware
app.add_middleware(SecurityHeadersMiddleware)

# CORS — must be added before routes. Allow frontend origin.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static Files (for uploads)
UPLOAD_DIR = "app/static/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/static", StaticFiles(directory="app/static"), name="static")

# Exception Handlers
app.add_exception_handler(Exception, global_exception_handler)
app.add_exception_handler(HTTPException, http_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Import routes after middleware is set up
from app.api.routes import auth, users, tasks, categories, analytics, settings as settings_routes, audit_logs, notifications, collaboration, attachments, health  # noqa: E402

app.include_router(health.router, prefix=f"{settings.API_V1_STR}/health", tags=["monitoring"])
app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["auth"])
app.include_router(users.router, prefix=f"{settings.API_V1_STR}/users", tags=["users"])
app.include_router(tasks.router, prefix=f"{settings.API_V1_STR}/tasks", tags=["tasks"])
app.include_router(categories.router, prefix=f"{settings.API_V1_STR}/categories", tags=["categories"])
app.include_router(analytics.router, prefix=f"{settings.API_V1_STR}/analytics", tags=["analytics"])
app.include_router(settings_routes.router, prefix=f"{settings.API_V1_STR}/settings", tags=["settings"])
app.include_router(audit_logs.router, prefix=f"{settings.API_V1_STR}/audit-logs", tags=["audit-logs"])
app.include_router(notifications.router, prefix=f"{settings.API_V1_STR}/notifications", tags=["notifications"])
app.include_router(collaboration.router, prefix=f"{settings.API_V1_STR}/collaboration", tags=["collaboration"])
app.include_router(attachments.router, prefix=f"{settings.API_V1_STR}/attachments", tags=["attachments"])


@app.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    await socket_manager.connect(websocket, user_id)
    try:
        while True:
            # Keep connection alive; can receive messages if needed
            data = await websocket.receive_text()
            # Respond or ignore
    except WebSocketDisconnect:
        socket_manager.disconnect(websocket, user_id)



@app.get("/")
def root():
    return {"message": "Welcome to Smart Task & Productivity Manager API"}

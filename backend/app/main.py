from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings

# Create app and register CORS FIRST — before any imports that could fail
app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

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

# Import routes after middleware is set up
from app.api.routes import auth, users, tasks, categories, analytics, settings as settings_routes, audit_logs  # noqa: E402

app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["auth"])
app.include_router(users.router, prefix=f"{settings.API_V1_STR}/users", tags=["users"])
app.include_router(tasks.router, prefix=f"{settings.API_V1_STR}/tasks", tags=["tasks"])
app.include_router(categories.router, prefix=f"{settings.API_V1_STR}/categories", tags=["categories"])
app.include_router(analytics.router, prefix=f"{settings.API_V1_STR}/analytics", tags=["analytics"])
app.include_router(settings_routes.router, prefix=f"{settings.API_V1_STR}/settings", tags=["settings"])
app.include_router(audit_logs.router, prefix=f"{settings.API_V1_STR}/audit-logs", tags=["audit-logs"])


@app.on_event("startup")
async def on_startup():
    """Run migrations and seed data at startup."""
    from app.db.alembic_utils import run_upgrade
    from app.db.database import SessionLocal
    from app.db.init_db import init_db
    run_upgrade()
    with SessionLocal() as db:
        init_db(db)


@app.get("/")
def root():
    return {"message": "Welcome to Smart Task & Productivity Manager API"}

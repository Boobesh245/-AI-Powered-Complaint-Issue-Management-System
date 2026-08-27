import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager

from app.config import settings
from app.database import connect_and_init_db, close_db_connection
from app.routers import (
    auth, users, complaints, departments, categories, staff,
    notifications, feedback, analytics, reports, settings as settings_router, audit
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    connect_and_init_db()
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    yield
    # Shutdown
    close_db_connection()

app = FastAPI(
    title=settings.APP_NAME,
    description="Enterprise AI-Powered Complaint & Issue Management System REST API",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow development frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static file serving for uploads
os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Include Routers under /api
api_prefix = "/api"
app.include_router(auth.router, prefix=api_prefix)
app.include_router(users.router, prefix=api_prefix)
app.include_router(complaints.router, prefix=api_prefix)
app.include_router(departments.router, prefix=api_prefix)
app.include_router(categories.router, prefix=api_prefix)
app.include_router(staff.router, prefix=api_prefix)
app.include_router(notifications.router, prefix=api_prefix)
app.include_router(feedback.router, prefix=api_prefix)
app.include_router(analytics.router, prefix=api_prefix)
app.include_router(reports.router, prefix=api_prefix)
app.include_router(settings_router.router, prefix=api_prefix)
app.include_router(audit.router, prefix=api_prefix)

@app.get("/")
def root():
    return {
        "success": True,
        "message": f"Welcome to {settings.APP_NAME} API",
        "version": "1.0.0",
        "docs_url": "/docs"
    }

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": settings.APP_NAME,
        "database": "connected"
    }

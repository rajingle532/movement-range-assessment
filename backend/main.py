from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.routers import stream, patients, sessions, auth, reports
from backend.config import settings
from backend.database import models
from backend.database.db import engine

# Database Tables Initialization
# NOTE: In production, use Alembic for migrations
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Full Stack Rehabilitation ROM Assessment Platform"
)

# CORS Settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health Check
@app.get("/")
async def health_check():
    return {"status": "healthy", "project": settings.PROJECT_NAME}

# Include Routers
app.include_router(auth.router)
app.include_router(stream.router)
app.include_router(patients.router)
app.include_router(sessions.router)
app.include_router(reports.router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)

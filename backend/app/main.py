from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from contextlib import asynccontextmanager
import uvicorn

from app.api.routes import auth, weather, alerts, accuracy, reports, upload, utilities
from app.core.config import settings
from app.core.database import create_tables


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await create_tables()
    yield
    # Shutdown


app = FastAPI(
    title="WeatherXpert API",
    description="Tata Power Weather Intelligence Platform — Backend API",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — allow frontend on Render + localhost dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(GZipMiddleware, minimum_size=1000)

# Routers
app.include_router(auth.router,       prefix="/api/v1/auth",       tags=["Auth"])
app.include_router(utilities.router,  prefix="/api/v1/utilities",  tags=["Utilities"])
app.include_router(weather.router,    prefix="/api/v1/weather",    tags=["Weather"])
app.include_router(alerts.router,     prefix="/api/v1/alerts",     tags=["Alerts"])
app.include_router(accuracy.router,   prefix="/api/v1/accuracy",   tags=["Accuracy"])
app.include_router(reports.router,    prefix="/api/v1/reports",    tags=["Reports"])
app.include_router(upload.router,     prefix="/api/v1/upload",     tags=["Upload"])


@app.get("/")
async def root():
    return {"status": "ok", "service": "WeatherXpert API", "version": "1.0.0"}


@app.get("/health")
async def health():
    return {"status": "healthy"}


if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)

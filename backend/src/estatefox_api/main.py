"""FastAPI application entrypoint with Lambda handler."""

from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum

from .config import settings
from .routes import health, items


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Application lifespan handler for startup/shutdown events."""
    # Startup
    yield
    # Shutdown


app = FastAPI(
    title="Estatefox API",
    description="Real estate app for South Florida property listings, search, and management.",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router)
app.include_router(items.router)

# Lambda handler via Mangum
handler = Mangum(app, lifespan="off")

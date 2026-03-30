from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import asyncio
from app.config import settings
from app.database import Base, engine
from app.services.market_feed import price_feed_loop
from app.routers import auth, market, alerts, research, admin

# ──────────────────────────────────────────────────────────────────────────────
# LIFESPAN — FastAPI's modern startup/shutdown pattern
# Everything before 'yield' runs on startup.
# Everything after 'yield' runs on shutdown.
# ──────────────────────────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    # STARTUP
    Base.metadata.create_all(bind=engine)          # Create tables if they don't exist
    feed_task = asyncio.create_task(price_feed_loop())  # Start background price loop
    yield
    # SHUTDOWN
    feed_task.cancel()                             # Stop the background task cleanly

app = FastAPI(
    title=settings.app_name,
    version="1.0",
    lifespan=lifespan,
)

# ──────────────────────────────────────────────────────────────────────────────
# CORS MIDDLEWARE
# Without CORS, the browser blocks requests from localhost:5173 to localhost:8000
# (different ports = different origins = CORS restriction)
# ──────────────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.allowed_origin],   # Whitelist: only your React app
    allow_credentials=True,                    # Allow cookies + auth headers
    allow_methods=["*"],                        # GET, POST, PUT, DELETE etc.
    allow_headers=["*"],                        # Authorization header etc.
)

# Mount all routers — each brings its own URL prefix
app.include_router(auth.router)      # /auth/*
app.include_router(market.router)    # /market/*
app.include_router(alerts.router)    # /alerts/*
app.include_router(research.router)  # /research/*
app.include_router(admin.router)     # /admin/*

@app.get("/")
async def health():
    return {"status": "operational", "service": "FinTelligence API"}
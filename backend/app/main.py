# app/main.py
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import asyncio
from app.config import settings
from app.database import Base, engine
from app.services.market_feed import price_feed_loop
from app.routers import auth, market, alerts, research, admin

@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    feed_task = asyncio.create_task(price_feed_loop())
    yield
    feed_task.cancel()

app = FastAPI(
    title=settings.app_name,
    version="1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.ALLOWED_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(market.router)
app.include_router(alerts.router)
app.include_router(research.router)
app.include_router(admin.router)

@app.get("/")
async def health():
    return {"status": "operational", "service": "FinTelligence API"}
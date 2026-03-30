# app/routers/market.py
from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from jose import JWTError, jwt

from app.config import settings
from app.database import get_db
from app.models.market import Watchlist, PriceSnapshot
from app.models.user import User
from app.middleware.auth_middleware import get_current_user
from app.services.websocket_manager import manager

router = APIRouter(prefix="/market", tags=["market"])


# ====================== REST Endpoints ======================

@router.get("/prices")
async def get_prices(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Return latest price snapshot for all symbols"""
    snapshots = db.query(PriceSnapshot).all()
    return [
        {
            "symbol": s.symbol,
            "open": s.open,
            "high": s.high,
            "low": s.low,
            "close": s.close,
            "volume": s.volume,
            "timestamp": s.timestamp,
        }
        for s in snapshots
    ]


@router.get("/watchlist")
async def get_watchlist(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Return current user's watchlist"""
    items = db.query(Watchlist).filter(Watchlist.user_id == current_user.id).all()
    return [
        {
            "id": w.id,
            "symbol": w.symbol,
            "avg_cost": w.avg_cost,
            "shares": w.shares,
            "added_at": w.added_at,
        }
        for w in items
    ]


@router.post("/watchlist/{symbol}")
async def add_to_watchlist(
    symbol: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Add a symbol to the current user's watchlist"""
    existing = db.query(Watchlist).filter(
        Watchlist.user_id == current_user.id,
        Watchlist.symbol == symbol.upper()
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Symbol already in watchlist")

    item = Watchlist(user_id=current_user.id, symbol=symbol.upper())
    db.add(item)
    db.commit()
    db.refresh(item)
    return {"id": item.id, "symbol": item.symbol}


@router.delete("/watchlist/{symbol}")
async def remove_from_watchlist(
    symbol: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Remove a symbol from the current user's watchlist"""
    item = db.query(Watchlist).filter(
        Watchlist.user_id == current_user.id,
        Watchlist.symbol == symbol.upper()
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail="Symbol not found in watchlist")

    db.delete(item)
    db.commit()
    return {"detail": "Removed successfully"}


# ====================== WebSocket ======================

@router.websocket("/ws/{token}")
async def market_websocket(websocket: WebSocket, token: str):
    """WebSocket endpoint — validates JWT from URL param then streams price updates"""
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM]
        )
        user_id = int(payload.get("sub"))
    except JWTError:
        await websocket.close(code=4001)
        return

    await manager.connect(websocket, user_id)

    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket, user_id)
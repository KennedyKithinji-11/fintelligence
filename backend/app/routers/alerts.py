# app/routers/alerts.py
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from datetime import datetime, timezone
from typing import Literal
from app.middleware.auth_middleware import get_current_user
from app.models.user import User

router = APIRouter(prefix="/alerts", tags=["alerts"])

AlertCategory = Literal["price", "news", "portfolio", "system"]
AlertSeverity = Literal["critical", "warning", "info"]


class Alert(BaseModel):
    id: int
    category: AlertCategory
    severity: AlertSeverity
    title: str
    message: str
    timestamp: str  # ISO 8601
    read: bool = False


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


# ---------------------------------------------------------------------------
# TODO: Replace MOCK_ALERTS with a real DB query, e.g.:
#   db.query(AlertModel).filter(AlertModel.user_id == current_user.id).all()
# ---------------------------------------------------------------------------
MOCK_ALERTS: list[Alert] = [
    Alert(
        id=1,
        category="price",
        severity="critical",
        title="BTC crossed $100,000",
        message="Bitcoin has exceeded your upper threshold of $100,000. Current price: $101,240.",
        timestamp=_now(),
    ),
    Alert(
        id=2,
        category="news",
        severity="warning",
        title="Fed rate decision in 2 hours",
        message="The Federal Reserve interest rate announcement is scheduled for 14:00 EST.",
        timestamp=_now(),
    ),
    Alert(
        id=3,
        category="portfolio",
        severity="info",
        title="Portfolio up 4.2% today",
        message="Your portfolio has gained 4.2% since market open, outperforming the S&P 500 by 1.8%.",
        timestamp=_now(),
    ),
    Alert(
        id=4,
        category="system",
        severity="info",
        title="Market data feed reconnected",
        message="The real-time price feed briefly disconnected and has been restored.",
        timestamp=_now(),
    ),
]


@router.get("", response_model=list[Alert])
async def list_alerts(current_user: User = Depends(get_current_user)):
    """
    Returns all active alerts for the current user.
    Replace MOCK_ALERTS with a DB query scoped to current_user.id.
    """
    return MOCK_ALERTS
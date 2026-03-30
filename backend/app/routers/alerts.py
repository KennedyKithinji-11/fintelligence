# app/routers/alerts.py
from fastapi import APIRouter, Depends
from app.middleware.auth_middleware import get_current_user
from app.models.user import User

router = APIRouter(prefix="/alerts", tags=["alerts"])


@router.get("")
async def list_alerts(current_user: User = Depends(get_current_user)):
    """Placeholder — implement alert CRUD here."""
    return []
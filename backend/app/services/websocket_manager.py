from fastapi import WebSocket
from typing import Dict, Set
import json

class ConnectionManager:
    """
    Registry of all active WebSocket connections.
    Maps user_id → set of WebSocket objects.
    Using a Set allows one user to have multiple tabs open simultaneously.
    """

    def __init__(self):
        # Dict[int, Set[WebSocket]] — user_id → {ws1, ws2, ...}
        self.active: Dict[int, Set[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, user_id: int):
        await websocket.accept()                          # Complete WebSocket handshake
        self.active.setdefault(user_id, set()).add(websocket)

    def disconnect(self, websocket: WebSocket, user_id: int):
        if user_id in self.active:
            self.active[user_id].discard(websocket)       # Remove without error if missing

    async def send_to_user(self, user_id: int, message: dict):
        # Use list() to avoid "set changed size during iteration" RuntimeError
        for ws in list(self.active.get(user_id, [])):
            try:
                await ws.send_text(json.dumps(message))
            except:
                self.active[user_id].discard(ws)          # Clean up dead connections

    async def broadcast(self, message: dict):
        """Send to ALL connected clients — used for market price updates."""
        for user_sockets in list(self.active.values()):
            for ws in list(user_sockets):
                try:
                    await ws.send_text(json.dumps(message))
                except:
                    pass                                   # Dead connections silently dropped

# Module-level singleton — the same instance is shared across ALL requests
# in this process. When broadcast() is called, it reaches every open connection.
manager = ConnectionManager()
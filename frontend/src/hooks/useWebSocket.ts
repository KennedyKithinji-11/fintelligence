// frontend/src/hooks/useWebSocket.ts
import { useEffect, useRef, useCallback } from 'react';

interface WebSocketMessage {
  type: string;
  data?: any;
}

export function useWebSocket(
  path: string,                    // e.g. '/market/ws'
  onMessage: (msg: WebSocketMessage) => void,
  enabled: boolean = true
) {
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);   // ← Fixed: use number instead of NodeJS.Timeout

  const WS_BASE = import.meta.env.VITE_WS_BASE || 'ws://localhost:8000';

  const connect = useCallback(() => {
    if (!enabled || socketRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    const token = localStorage.getItem('access_token');
    if (!token) {
      console.warn('No access token found for WebSocket connection');
      return;
    }

    const wsUrl = `${WS_BASE}${path}/${token}`;

    console.log(`Connecting to WebSocket: ${wsUrl}`);

    const ws = new WebSocket(wsUrl);
    socketRef.current = ws;

    ws.onopen = () => {
      console.log('✅ WebSocket connected successfully');
    };

    ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        onMessage(message);
      } catch (err) {
        console.error('Failed to parse WebSocket message:', err);
      }
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected. Reconnecting in 3 seconds...');
      socketRef.current = null;

      // Auto-reconnect
      reconnectTimeoutRef.current = window.setTimeout(() => {
        connect();
      }, 3000);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error occurred:', error);
    };
  }, [path, onMessage, enabled, WS_BASE]);

  // Connect on mount + cleanup on unmount
  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        window.clearTimeout(reconnectTimeoutRef.current);
      }
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [connect]);

  // Manual reconnect function (useful if token changes)
  const reconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.close();
    }
    connect();
  }, [connect]);

  return { reconnect };
}
// frontend/src/hooks/useMarketData.ts
import { useState, useCallback, useEffect } from 'react';
import { useWebSocket } from './useWebSocket';

export interface PriceTick {
  symbol: string;
  price: number;
  change: number;
  change_pct: number;
  volume: number;
}

export function useMarketData() {
  const [prices, setPrices] = useState<Map<string, PriceTick>>(
    () => new Map()
  );

  const handleMessage = useCallback((msg: any) => {
    if (msg.type !== 'price_update' || !msg.data) return;

    setPrices(prev => {
      const next = new Map(prev);
      (msg.data as PriceTick[]).forEach(tick => {
        next.set(tick.symbol, tick);
      });
      return next;
    });
  }, []);

  // Pass the path without token — useWebSocket will append /token
  useWebSocket('/market/ws', handleMessage);

  return prices;
}
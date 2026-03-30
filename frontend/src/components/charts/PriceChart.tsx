import { useState, useEffect, useRef } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { PriceTick } from '../../hooks/useMarketData';

interface Props {
  symbol: string;
  prices: Map<string, PriceTick>;
}

interface ChartPoint { time: string; price: number; }

const MAX_POINTS = 60;

export function PriceChart({ symbol, prices }: Props) {
  const bufferRef = useRef<ChartPoint[]>([]);
  const [chartData, setChartData] = useState<ChartPoint[]>([]);

  useEffect(() => {
    const tick = prices.get(symbol);
    if (!tick) return;

    const point: ChartPoint = {
      time: new Date().toLocaleTimeString('en-GB', { hour12: false }),
      price: tick.price,
    };

    bufferRef.current = [...bufferRef.current.slice(-(MAX_POINTS - 1)), point];
    setChartData([...bufferRef.current]);
  }, [prices, symbol]);

  const tick = prices.get(symbol);
  const isPositive = (tick?.change_pct ?? 0) >= 0;
  const colour = isPositive ? '#00e676' : '#ff4444';

  return (
    <div className="flex flex-col h-full bg-[#0a0f1e] p-4">
      <div className="flex items-baseline gap-4 mb-4">
        <span className="text-2xl font-bold font-mono">{symbol}</span>
        <span className="text-3xl font-bold">${tick?.price.toFixed(2) ?? '—'}</span>
        <span style={{ color: colour }} className="text-sm font-mono">
          {isPositive ? '+' : ''}{tick?.change_pct.toFixed(3)}%
        </span>
      </div>
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colour} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={colour} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="time" tick={{ fill: '#4a5270', fontSize: 10 }} />
            <YAxis domain={['auto', 'auto']} tick={{ fill: '#4a5270', fontSize: 10 }}/>
            <Tooltip
              contentStyle={{ background: '#0f1629', border: '1px solid #2a3560' }}
              labelStyle={{ color: '#7a83a6' }}
            />
            <Area
              type="monotone"
              dataKey="price"
              stroke={colour}
              strokeWidth={1.5}
              fill="url(#priceGrad)"
              isAnimationActive={false}                
              
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
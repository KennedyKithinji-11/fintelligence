import { PriceTick } from '../hooks/useMarketData'

interface Props {
  prices: Map<string, PriceTick>
}

export function MarketTicker({ prices }: Props) {
  const ticks = Array.from(prices.values())

  if (ticks.length === 0) {
    return (
      <div className="h-10 bg-[#0a0f1e] border-b border-[#2a3560] flex items-center px-4">
        <span className="text-[#4a5270] text-xs font-mono animate-pulse">
          Connecting to market feed...
        </span>
      </div>
    )
  }

  return (
    <div className="h-10 bg-[#0a0f1e] border-b border-[#2a3560] overflow-hidden flex items-center">
      {/* Duplicate ticks for seamless looping scroll animation */}
      <div className="flex gap-8 animate-[marquee_30s_linear_infinite] whitespace-nowrap">
        {[...ticks, ...ticks].map((tick, i) => {
          const isUp = tick.change_pct >= 0
          return (
            <div key={i} className="flex items-center gap-2 text-xs font-mono">
              <span className="text-white font-bold">{tick.symbol}</span>
              <span className="text-[#e8eaf2]">${tick.price.toFixed(2)}</span>
              <span className={isUp ? 'text-[#00e676]' : 'text-[#ff4444]'}>
                {isUp ? '▲' : '▼'} {Math.abs(tick.change_pct).toFixed(2)}%
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* Add this to your tailwind.config.js theme.extend to enable the marquee animation:
   keyframes: {
     marquee: { '0%': { transform: 'translateX(0)' }, '100%': { transform: 'translateX(-50%)' } }
   },
   animation: { marquee: 'marquee 30s linear infinite' }
*/
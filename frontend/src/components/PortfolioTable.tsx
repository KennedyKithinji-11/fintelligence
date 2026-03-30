import { PriceTick } from '../hooks/useMarketData'

interface Props {
  prices: Map<string, PriceTick>
  onSelect: (symbol: string) => void
}

const SYMBOLS = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA']

export function PortfolioTable({ prices, onSelect }: Props) {
  return (
    <div className="bg-[#0f1629] overflow-y-auto">
      <div className="p-3 border-b border-[#2a3560]">
        <h3 className="text-[#7a83a6] text-xs uppercase tracking-wider font-mono">
          Watchlist
        </h3>
      </div>
      <div>
        {SYMBOLS.map(symbol => {
          const tick = prices.get(symbol)
          const isUp = (tick?.change_pct ?? 0) >= 0
          return (
            <button
              key={symbol}
              onClick={() => onSelect(symbol)}
              className="w-full text-left px-4 py-3 border-b border-[#2a3560]/50 hover:bg-[#151d35] transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-white font-mono font-bold text-sm">{symbol}</span>
                <span className={`text-xs font-mono font-bold ${isUp ? 'text-[#00e676]' : 'text-[#ff4444]'}`}>
                  {isUp ? '+' : ''}{tick?.change_pct.toFixed(2) ?? '—'}%
                </span>
              </div>
              <div className="text-[#e8eaf2] text-sm font-mono mt-0.5">
                ${tick?.price.toFixed(2) ?? '—'}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
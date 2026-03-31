import { useState } from 'react';
import { useMarketData } from '../hooks/useMarketData';
import { useAuth } from '../context/AuthContext';
import { MarketTicker } from '../components/MarketTicker';
import { PortfolioTable } from '../components/PortfolioTable';
import { PriceChart } from '../components/charts/PriceChart';
import { AIResearchPanel } from '../components/AIResearchPanel';
import { AlertsPanel } from '../components/AlertsPanel';

export default function Dashboard() {
  const prices = useMarketData();   // Single WS connection for entire page
  const { user } = useAuth();
  const [selectedSymbol, setSelectedSymbol] = useState('AAPL');

  return (
    <div className="h-screen flex flex-col bg-[#050810] text-white overflow-hidden">

      {/* Top: scrolling live price strip */}
      <MarketTicker prices={prices} />

      {/* Main: 3-column layout */}
      <div className="flex-1 grid grid-cols-[280px_1fr_340px] gap-px bg-[#2a3560] overflow-hidden">

        {/* Left: Portfolio watchlist */}
        <PortfolioTable prices={prices} onSelect={setSelectedSymbol} />

        {/* Centre: Live chart for selected symbol */}
        <PriceChart symbol={selectedSymbol} prices={prices} />

        {/* Right: AI research + alerts (role-gated) */}
        <div className="flex flex-col gap-px">
          {user?.role !== 'viewer' && <AIResearchPanel />}
          <AlertsPanel />
        </div>

      </div>
    </div>
  );
}
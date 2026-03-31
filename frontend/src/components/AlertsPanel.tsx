import { useState, useEffect } from 'react';
import client from '../api/client';

type AlertSeverity = 'critical' | 'warning' | 'info';
type AlertCategory = 'price' | 'news' | 'portfolio' | 'system';

interface Alert {
  id: string | number;
  category: AlertCategory;
  severity: AlertSeverity;
  title: string;
  message: string;
  timestamp: string;
  read?: boolean;
}

const CATEGORY_ICONS: Record<AlertCategory, string> = {
  price:     '◈',
  news:      '◎',
  portfolio: '◆',
  system:    '⬡',
};

const CATEGORY_LABELS: Record<AlertCategory, string> = {
  price:     'Price',
  news:      'News',
  portfolio: 'Portfolio',
  system:    'System',
};

const SEVERITY_COLORS: Record<AlertSeverity, { dot: string; border: string; text: string; bg: string }> = {
  critical: {
    dot:    'bg-red-500',
    border: 'border-red-500/30',
    text:   'text-red-400',
    bg:     'bg-red-500/5',
  },
  warning: {
    dot:    'bg-yellow-400',
    border: 'border-yellow-400/30',
    text:   'text-yellow-400',
    bg:     'bg-yellow-400/5',
  },
  info: {
    dot:    'bg-[#00d4ff]',
    border: 'border-[#2a3560]',
    text:   'text-[#00d4ff]',
    bg:     'bg-[#00d4ff]/5',
  },
};

const ALL_CATEGORIES: AlertCategory[] = ['price', 'news', 'portfolio', 'system'];

export function AlertsPanel() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<AlertCategory | 'all'>('all');

  const fetchAlerts = async () => {
    try {
      setError(null);
      const { data } = await client.get('/alerts');
      setAlerts(data);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to load alerts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    // Poll every 30 seconds for new alerts
    const interval = setInterval(fetchAlerts, 30_000);
    return () => clearInterval(interval);
  }, []);

  const markRead = (id: string | number) => {
    setAlerts(prev =>
      prev.map(a => a.id === id ? { ...a, read: true } : a)
    );
  };

  const dismissAlert = (id: string | number) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  const filtered = activeFilter === 'all'
    ? alerts
    : alerts.filter(a => a.category === activeFilter);

  const unreadCount = alerts.filter(a => !a.read).length;

  const countFor = (cat: AlertCategory) => alerts.filter(a => a.category === cat).length;

  return (
    <div className="flex flex-col h-full bg-[#0a0f1e] border-b border-[#2a3560] p-3">

      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-[#00d4ff] uppercase tracking-wider">
            Alerts
          </span>
          {unreadCount > 0 && (
            <span className="text-[10px] bg-red-500 text-white font-bold px-1.5 py-0.5 rounded-full leading-none">
              {unreadCount}
            </span>
          )}
        </div>
        <button
          onClick={fetchAlerts}
          className="text-[10px] text-[#4a5270] hover:text-[#00d4ff] transition-colors font-mono"
          title="Refresh alerts"
        >
          ↻ Refresh
        </button>
      </div>

      {/* Category Filter Pills */}
      <div className="flex gap-1 mb-2 flex-wrap">
        <button
          onClick={() => setActiveFilter('all')}
          className={`text-[10px] px-2 py-0.5 rounded-full border font-mono transition-colors ${
            activeFilter === 'all'
              ? 'bg-[#00d4ff]/10 border-[#00d4ff] text-[#00d4ff]'
              : 'border-[#2a3560] text-[#4a5270] hover:border-[#4a5270] hover:text-[#7a83a6]'
          }`}
        >
          All {alerts.length > 0 && `(${alerts.length})`}
        </button>
        {ALL_CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveFilter(cat)}
            className={`text-[10px] px-2 py-0.5 rounded-full border font-mono transition-colors ${
              activeFilter === cat
                ? 'bg-[#00d4ff]/10 border-[#00d4ff] text-[#00d4ff]'
                : 'border-[#2a3560] text-[#4a5270] hover:border-[#4a5270] hover:text-[#7a83a6]'
            }`}
          >
            {CATEGORY_ICONS[cat]} {CATEGORY_LABELS[cat]}
            {countFor(cat) > 0 && ` (${countFor(cat)})`}
          </button>
        ))}
      </div>

      {/* Alert List */}
      <div className="flex-1 overflow-y-auto space-y-1.5 min-h-0">

        {loading && (
          <div className="text-xs text-[#4a5270] animate-pulse text-center mt-4">
            Loading alerts...
          </div>
        )}

        {error && (
          <div className="text-xs bg-red-500/10 border border-red-500/20 text-red-400 rounded p-2">
            {error}
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="text-[#4a5270] text-xs text-center mt-4">
            {activeFilter === 'all' ? 'No active alerts' : `No ${CATEGORY_LABELS[activeFilter as AlertCategory]} alerts`}
          </div>
        )}

        {filtered.map(alert => {
          const colors = SEVERITY_COLORS[alert.severity];
          return (
            <div
              key={alert.id}
              onClick={() => markRead(alert.id)}
              className={`relative text-xs rounded p-2 border cursor-pointer transition-opacity ${colors.bg} ${colors.border} ${
                alert.read ? 'opacity-50' : 'opacity-100'
              }`}
            >
              {/* Unread dot */}
              {!alert.read && (
                <span className={`absolute top-2 right-2 w-1.5 h-1.5 rounded-full ${colors.dot}`} />
              )}

              {/* Category + severity */}
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className={`font-mono ${colors.text}`}>
                  {CATEGORY_ICONS[alert.category]}
                </span>
                <span className={`font-mono uppercase tracking-wider text-[10px] ${colors.text}`}>
                  {alert.severity}
                </span>
                <span className="text-[#4a5270] text-[10px]">·</span>
                <span className="text-[#4a5270] text-[10px]">{CATEGORY_LABELS[alert.category]}</span>
              </div>

              {/* Title */}
              <div className="text-white font-medium mb-0.5 pr-4">{alert.title}</div>

              {/* Message */}
              <div className="text-[#7a83a6] leading-relaxed">{alert.message}</div>

              {/* Footer: timestamp + dismiss */}
              <div className="flex items-center justify-between mt-1">
                <span className="text-[#4a5270] text-[10px] font-mono">
                  {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <button
                  onClick={e => { e.stopPropagation(); dismissAlert(alert.id); }}
                  className="text-[10px] text-[#4a5270] hover:text-red-400 transition-colors font-mono"
                >
                  dismiss
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

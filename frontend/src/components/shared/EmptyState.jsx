import { BarChart2, BriefcaseBusiness, FileText, Search, TrendingUp, Wifi } from 'lucide-react';

const illustrations = {
  portfolio: { icon: BriefcaseBusiness, bg: '#EAEBF7', fg: '#010131' },
  search:    { icon: Search,            bg: '#FFF8E6', fg: '#F2A600' },
  chart:     { icon: BarChart2,         bg: '#F0EEFE', fg: '#7C5FDB' },
  reports:   { icon: FileText,          bg: '#E6FAF5', fg: '#00C896' },
  market:    { icon: TrendingUp,        bg: '#FFF0F3', fg: '#FF4B6E' },
  offline:   { icon: Wifi,              bg: '#F4F6FB', fg: '#9AA3BD' },
};

export default function EmptyState({ type = 'search', title, description, actionLabel, onAction }) {
  const config = illustrations[type] || illustrations.search;
  const Icon = config.icon;

  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 animate-fade-in">
      <div className="w-16 h-16 rounded-md flex items-center justify-center mb-5" style={{ background: config.bg, borderRadius: 'var(--r-lg)' }}>
        <Icon size={28} style={{ color: config.fg }} strokeWidth={1.5} />
      </div>
      <h3 className="font-head text-[14px] font-bold text-center mb-1" style={{ color: 'var(--navy)' }}>{title}</h3>
      {description && <p className="text-[12px] text-center max-w-[240px] leading-relaxed" style={{ color: 'var(--text-3)' }}>{description}</p>}
      {actionLabel && onAction && (
        <button onClick={onAction}
          className="mt-4 px-5 py-2.5 text-[12px] font-bold text-white active:scale-95 transition-all duration-150"
          style={{ background: 'var(--navy)', borderRadius: 'var(--r-md)' }}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}

import { Pin } from 'lucide-react';

export default function FeatureCard({ icon: Icon, category, title, color, badge, onClick, subtitle, onPin, pinned }) {
  const iconColors = {
    teal:   { bg: 'bg-teal-50',   stroke: 'text-teal-700',   cat: 'text-teal-600',   gradFrom: 'from-teal-50/40',   gradTo: 'to-white' },
    blue:   { bg: 'bg-brand-50',  stroke: 'text-brand-700',  cat: 'text-brand-600',  gradFrom: 'from-brand-50/40',  gradTo: 'to-white' },
    amber:  { bg: 'bg-amber-50',  stroke: 'text-amber-700',  cat: 'text-amber-600',  gradFrom: 'from-amber-50/40',  gradTo: 'to-white' },
    violet: { bg: 'bg-violet-50', stroke: 'text-violet-700', cat: 'text-violet-600', gradFrom: 'from-violet-50/40', gradTo: 'to-white' },
    coral:  { bg: 'bg-coral-50',  stroke: 'text-coral-600',  cat: 'text-coral-600',  gradFrom: 'from-coral-50/40',  gradTo: 'to-white' },
    forest: { bg: 'bg-forest-50', stroke: 'text-forest-600', cat: 'text-forest-600', gradFrom: 'from-forest-50/40', gradTo: 'to-white' },
  };

  const c = iconColors[color] ?? iconColors.blue;

  return (
    <div className={`card card-hover p-3 flex flex-col gap-2 text-left w-full relative overflow-hidden animate-slide-up bg-gradient-to-br ${c.gradFrom} ${c.gradTo}`}>
      {/* Pin button */}
      {onPin && (
        <button
          onClick={(e) => { e.stopPropagation(); onPin(); }}
          className="absolute top-1.5 right-1.5 p-1 rounded-md hover:bg-white/60 transition-colors active:scale-90 z-10"
          aria-label={pinned ? 'Unpin' : 'Pin to My Screen'}
        >
          <Pin size={10} className={pinned ? 'text-teal-500' : 'text-gray-300'} />
        </button>
      )}

      {/* Main clickable area */}
      <button onClick={onClick} className="text-left w-full flex flex-col gap-2">
        {/* Icon */}
        <div className={`w-9 h-9 rounded-xl ${c.bg} flex items-center justify-center`}>
          <Icon size={16} className={c.stroke} strokeWidth={1.8} />
        </div>

        {/* Text */}
        <div>
          <p className={`text-2xs font-bold uppercase tracking-wider ${c.cat} mb-0.5`}>{category}</p>
          <p className="text-sm font-semibold text-brand-900 leading-tight">{title}</p>
          {subtitle && <p className="text-2xs text-gray-400 mt-0.5 leading-snug">{subtitle}</p>}
        </div>
      </button>

      {/* Badge */}
      {badge && (
        <span className={`absolute ${onPin ? 'top-7 right-1.5' : 'top-2 right-2'} text-[7px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full ${
          badge === 'NEW'  ? 'bg-violet-100 text-violet-700 ring-1 ring-violet-200' :
          badge === 'HOT'  ? 'bg-coral-100 text-coral-600 ring-1 ring-coral-200 animate-pulse-dot'   :
          badge === 'LIVE' ? 'bg-teal-100 text-teal-700 ring-1 ring-teal-200'     : ''
        }`}>
          {badge === 'LIVE' && <span className="inline-block w-1 h-1 rounded-full bg-teal-500 mr-0.5 animate-pulse-dot" />}
          {badge}
        </span>
      )}
    </div>
  );
}

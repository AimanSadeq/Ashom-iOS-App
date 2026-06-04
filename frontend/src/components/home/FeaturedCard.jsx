import { ArrowRight, Sparkles } from 'lucide-react';

export default function FeaturedCard({ icon: Icon, category, title, description, badge, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full p-4 flex items-center gap-4 text-left relative overflow-hidden animate-fade-in rounded-xl
                 bg-gradient-to-br from-violet-50 via-brand-50 to-white
                 border border-violet-100/80 shadow-card
                 transition-all duration-200 hover:shadow-card-hover hover:-translate-y-0.5 active:scale-[0.98]
                 group"
    >
      {/* Decorative background shimmer */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 -skew-x-12 translate-x-full group-hover:translate-x-[-100%]" style={{ transition: 'transform 0.8s ease, opacity 0.3s' }} />

      {/* Icon with glow */}
      <div className="relative flex-shrink-0">
        <div className="absolute inset-0 rounded-2xl bg-violet-300/20 blur-md scale-125" />
        <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-br from-violet-100 to-violet-50 flex items-center justify-center ring-1 ring-violet-200/50">
          <Icon size={20} className="text-violet-700" strokeWidth={1.7} />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <Sparkles size={10} className="text-violet-500" />
          <p className="text-2xs font-bold uppercase tracking-wider text-violet-600">{category}</p>
        </div>
        <p className="text-md font-bold text-brand-900 leading-snug">{title}</p>
        <p className="text-xs text-gray-400 leading-relaxed mt-0.5 truncate">{description}</p>
      </div>

      {/* Arrow */}
      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-violet-100 flex items-center justify-center group-hover:bg-violet-200 transition-colors">
        <ArrowRight size={13} className="text-violet-600 group-hover:translate-x-0.5 transition-transform" />
      </div>

      {/* Badge */}
      {badge && (
        <span className="absolute top-2.5 right-2.5 text-[7px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-violet-600 text-white shadow-sm">
          {badge}
        </span>
      )}
    </button>
  );
}

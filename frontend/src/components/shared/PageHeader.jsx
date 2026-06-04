import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PageHeader({ title, subtitle, backTo }) {
  const navigate = useNavigate();
  return (
    <div className="flex items-center gap-3 px-5 py-3 glass-header" style={{ borderBottom: '1px solid var(--border)' }}>
      {backTo && (
        <button
          onClick={() => navigate(backTo)}
          aria-label="Go back"
          className="w-8 h-8 rounded-full flex items-center justify-center active:scale-90 transition-all duration-150"
          style={{ border: '1px solid var(--border)', background: 'var(--bg)' }}
        >
          <ArrowLeft size={14} style={{ color: 'var(--text-2)' }} />
        </button>
      )}
      <div>
        <h1 className="font-head text-lg font-bold leading-tight" style={{ color: 'var(--navy)' }}>{title}</h1>
        {subtitle && <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-3)' }}>{subtitle}</p>}
      </div>
    </div>
  );
}

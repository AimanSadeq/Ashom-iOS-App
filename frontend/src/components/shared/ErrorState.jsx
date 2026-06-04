import { AlertTriangle } from 'lucide-react';

export default function ErrorState({ message = 'Something went wrong', onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
      <div className="w-14 h-14 rounded-md flex items-center justify-center mb-4" style={{ background: 'var(--red-bg)', borderRadius: 'var(--r-lg)' }}>
        <AlertTriangle size={22} style={{ color: 'var(--red)' }} strokeWidth={1.8} />
      </div>
      <p className="font-head text-[14px] font-bold mb-1" style={{ color: 'var(--navy)' }}>Something went wrong</p>
      <p className="text-[12px] text-center max-w-[240px] leading-relaxed" style={{ color: 'var(--text-3)' }}>{message}</p>
      {onRetry && (
        <button onClick={onRetry}
          className="mt-4 px-5 py-2.5 text-[12px] font-bold text-white active:scale-95 transition-all duration-150"
          style={{ background: 'var(--navy)', borderRadius: 'var(--r-md)' }}>
          Try again
        </button>
      )}
    </div>
  );
}

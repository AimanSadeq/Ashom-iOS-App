export default function LoadingState({ message = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
      <div className="relative mb-4">
        <div className="w-10 h-10 rounded-full animate-spin" style={{ border: '2px solid var(--blue-light)', borderTopColor: 'var(--blue)' }} />
      </div>
      <p className="text-[12px] font-medium" style={{ color: 'var(--text-3)' }}>{message}</p>
    </div>
  );
}

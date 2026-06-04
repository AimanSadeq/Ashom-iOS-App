import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Users, Plus, X, ChevronRight, ChevronDown, GraduationCap, Trash2, Crown, User } from 'lucide-react';
import PageHeader from '../components/shared/PageHeader';

const STORAGE_KEY = 'vifm-family-members';

const INITIAL_FAMILY = [
  {
    id: 1, name: 'Aiman Sadeq', initials: 'AS', role: 'parent', color: '#010131',
    balance: 132783, change: 2.75,
    holdings: [
      { ticker: '2222.SR', name: 'Saudi Aramco', value: 52610 },
      { ticker: 'BTC', name: 'Bitcoin', value: 15859 },
      { ticker: 'XAU', name: 'Gold', value: 8189 },
    ],
    courses: null,
  },
  {
    id: 2, name: 'Sara Sadeq', initials: 'SS', role: 'child', color: '#5391D5',
    balance: 10000, change: 5.2,
    holdings: [
      { ticker: '1120.SR', name: 'Al Rajhi Bank', value: 4500 },
      { ticker: 'EMAAR.AE', name: 'Emaar', value: 3200 },
    ],
    courses: { completed: 2, total: 6 },
  },
  {
    id: 3, name: 'Omar Sadeq', initials: 'OS', role: 'student', color: '#7C5FDB',
    balance: 10000, change: -1.3,
    holdings: [
      { ticker: 'QNBK.QA', name: 'QNB', value: 5000 },
      { ticker: 'ETH', name: 'Ethereum', value: 3000 },
    ],
    courses: { completed: 4, total: 6 },
  },
];

const AVATAR_COLORS = ['#010131', '#5391D5', '#7C5FDB', '#00A8A0', '#E67E22', '#E74C3C'];

function loadFamily() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || INITIAL_FAMILY; }
  catch { return INITIAL_FAMILY; }
}

function saveFamily(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function fmt(n) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function RoleBadge({ role }) {
  const map = {
    parent:  { bg: 'var(--navy)',  label: 'Parent' },
    child:   { bg: 'var(--blue)',  label: 'Child' },
    student: { bg: '#7C5FDB',     label: 'Student' },
  };
  const r = map[role] || map.child;
  return (
    <span
      className="text-[9px] font-extrabold uppercase px-[7px] py-[2px] rounded-full text-white"
      style={{ background: r.bg }}
    >
      {r.label}
    </span>
  );
}

function Avatar({ initials, color, size = 40 }) {
  return (
    <div
      className="rounded-full flex items-center justify-center text-white font-head font-bold flex-shrink-0"
      style={{ width: size, height: size, background: color, fontSize: size * 0.35 }}
    >
      {initials}
    </div>
  );
}

/* ─── Member Card ─── */
function MemberCard({ member, expanded, onToggle, onRemove }) {
  const positive = member.change >= 0;
  return (
    <div
      className="rounded-md animate-fade-up"
      style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
    >
      {/* Header row */}
      <button
        className="w-full flex items-center gap-3 p-4 text-left"
        onClick={onToggle}
      >
        <Avatar initials={member.initials} color={member.color} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-head text-[14px] font-bold truncate" style={{ color: 'var(--navy)' }}>{member.name}</span>
            <RoleBadge role={member.role} />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-bold" style={{ color: 'var(--navy)' }}>{fmt(member.balance)}</span>
            <span
              className="text-[11px] font-bold px-[6px] py-[1px] rounded"
              style={{
                color: positive ? 'var(--green)' : 'var(--red)',
                background: positive ? 'var(--green-bg)' : 'var(--red-bg)',
              }}
            >
              {positive ? '+' : ''}{member.change.toFixed(1)}%
            </span>
          </div>
        </div>
        {expanded
          ? <ChevronDown size={16} style={{ color: 'var(--text-3)', flexShrink: 0 }} />
          : <ChevronRight size={16} style={{ color: 'var(--text-3)', flexShrink: 0 }} />
        }
      </button>

      {/* Ticker pills */}
      <div className="flex flex-wrap gap-1.5 px-4 pb-3">
        {member.holdings.slice(0, 3).map(h => (
          <span
            key={h.ticker}
            className="text-[10px] font-bold px-2 py-[3px] rounded"
            style={{ background: 'var(--blue-light)', color: 'var(--blue)' }}
          >
            {h.ticker}
          </span>
        ))}
      </div>

      {/* Learning progress for students/children */}
      {member.courses && (
        <div className="px-4 pb-3">
          <div className="flex items-center gap-1.5 mb-1">
            <GraduationCap size={12} style={{ color: '#7C5FDB' }} />
            <span className="text-[10px] font-bold" style={{ color: 'var(--text-3)' }}>
              {member.courses.completed}/{member.courses.total} courses
            </span>
          </div>
          <div className="w-full h-[5px] rounded-full" style={{ background: 'var(--border)' }}>
            <div
              className="h-full rounded-full"
              style={{
                width: `${(member.courses.completed / member.courses.total) * 100}%`,
                background: '#7C5FDB',
              }}
            />
          </div>
        </div>
      )}

      {/* Expanded detail */}
      {expanded && (
        <div className="px-4 pb-4 pt-1" style={{ borderTop: '1px solid var(--border)' }}>
          {/* Holdings table */}
          <p className="text-[10px] font-bold uppercase tracking-[0.8px] mb-2" style={{ color: 'var(--text-3)' }}>Holdings</p>
          <div className="flex flex-col gap-1.5 mb-4">
            {member.holdings.map(h => (
              <div key={h.ticker} className="flex items-center justify-between">
                <div>
                  <span className="text-[12px] font-bold" style={{ color: 'var(--navy)' }}>{h.name}</span>
                  <span className="text-[10px] ml-1.5" style={{ color: 'var(--text-3)' }}>{h.ticker}</span>
                </div>
                <span className="text-[12px] font-bold" style={{ color: 'var(--navy)' }}>{fmt(h.value)}</span>
              </div>
            ))}
          </div>

          {/* Learning milestones */}
          {member.courses && (
            <div className="mb-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.8px] mb-2" style={{ color: 'var(--text-3)' }}>Learning Milestones</p>
              <p className="text-[11px]" style={{ color: 'var(--text-2)' }}>
                Completed {member.courses.completed} of {member.courses.total} courses
              </p>
            </div>
          )}

          {/* Performance placeholder */}
          <div
            className="w-full h-[80px] rounded-md flex items-center justify-center mb-3"
            style={{ background: 'var(--bg)', border: '1px dashed var(--border)' }}
          >
            <span className="text-[11px]" style={{ color: 'var(--text-3)' }}>Performance chart coming soon</span>
          </div>

          {/* Remove button */}
          <button
            className="flex items-center gap-1.5 text-[12px] font-bold mt-1"
            style={{ color: 'var(--red)' }}
            onClick={(e) => { e.stopPropagation(); onRemove(member.id); }}
          >
            <Trash2 size={13} /> Remove Member
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── Add Member Modal ─── */
function AddMemberModal({ onClose, onAdd }) {
  const [form, setForm] = useState({ name: '', role: 'child', balance: '10000', color: AVATAR_COLORS[1] });

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) return;
    const words = form.name.trim().split(' ');
    const initials = words.length >= 2
      ? (words[0][0] + words[words.length - 1][0]).toUpperCase()
      : words[0].substring(0, 2).toUpperCase();
    onAdd({
      id: Date.now(),
      name: form.name.trim(),
      initials,
      role: form.role,
      color: form.color,
      balance: parseFloat(form.balance) || 10000,
      change: 0,
      holdings: [],
      courses: form.role !== 'parent' ? { completed: 0, total: 6 } : null,
    });
    onClose();
  }

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div
        className="relative w-full max-w-[430px] rounded-t-2xl p-5 pb-8 animate-slide-up"
        style={{ background: 'var(--card)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-head text-[16px] font-bold" style={{ color: 'var(--navy)' }}>Add Family Member</h3>
          <button onClick={onClose} className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: 'var(--bg)' }}>
            <X size={14} style={{ color: 'var(--text-2)' }} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Name */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-[0.8px] mb-1 block" style={{ color: 'var(--text-3)' }}>Full Name</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Layla Sadeq"
              className="w-full h-10 px-3 text-[13px] rounded-md outline-none"
              style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text-1)' }}
              autoFocus
            />
          </div>

          {/* Role */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-[0.8px] mb-1.5 block" style={{ color: 'var(--text-3)' }}>Role</label>
            <div className="flex gap-2">
              {[
                { value: 'parent', label: 'Parent', Icon: Crown },
                { value: 'child', label: 'Child', Icon: User },
                { value: 'student', label: 'Student', Icon: GraduationCap },
              ].map(r => (
                <button
                  type="button"
                  key={r.value}
                  onClick={() => setForm({ ...form, role: r.value })}
                  className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-md text-[12px] font-bold transition-all"
                  style={{
                    border: form.role === r.value ? '2px solid var(--navy)' : '1px solid var(--border)',
                    background: form.role === r.value ? 'var(--blue-light)' : 'var(--bg)',
                    color: form.role === r.value ? 'var(--navy)' : 'var(--text-2)',
                  }}
                >
                  <r.Icon size={13} /> {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* Starting Balance */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-[0.8px] mb-1 block" style={{ color: 'var(--text-3)' }}>Starting Balance ($)</label>
            <input
              type="number"
              value={form.balance}
              onChange={e => setForm({ ...form, balance: e.target.value })}
              className="w-full h-10 px-3 text-[13px] rounded-md outline-none"
              style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text-1)' }}
            />
          </div>

          {/* Avatar Color */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-[0.8px] mb-1.5 block" style={{ color: 'var(--text-3)' }}>Avatar Color</label>
            <div className="flex gap-2.5">
              {AVATAR_COLORS.map(c => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setForm({ ...form, color: c })}
                  className="w-8 h-8 rounded-full transition-all"
                  style={{
                    background: c,
                    outline: form.color === c ? '3px solid var(--blue)' : 'none',
                    outlineOffset: 2,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full h-11 rounded-md text-white font-head text-[14px] font-bold mt-1 flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
            style={{ background: 'var(--navy)' }}
          >
            <Plus size={16} /> Add Member
          </button>
        </form>
      </div>
    </div>,
    document.body,
  );
}

/* ─── Main Page ─── */
export default function FamilyPortfolioPage() {
  const [members, setMembers] = useState(loadFamily);
  const [expandedId, setExpandedId] = useState(null);
  const [showAdd, setShowAdd] = useState(false);

  const netWorth = members.reduce((s, m) => s + m.balance, 0);
  const totalChange = members.length
    ? members.reduce((s, m) => s + m.change * m.balance, 0) / netWorth
    : 0;
  const positive = totalChange >= 0;

  function handleAdd(member) {
    const updated = [...members, member];
    setMembers(updated);
    saveFamily(updated);
  }

  function handleRemove(id) {
    const updated = members.filter(m => m.id !== id);
    setMembers(updated);
    saveFamily(updated);
    if (expandedId === id) setExpandedId(null);
  }

  return (
    <div className="animate-fade-in pb-28">
      <PageHeader title="Family Hub" subtitle="Track your family's investments" backTo="/" />

      {/* ── Overview Card ── */}
      <div className="px-5 pt-5">
        <div
          className="rounded-lg p-5"
          style={{
            background: 'linear-gradient(135deg, #010131 0%, #1a1c4e 50%, #2a3a6e 100%)',
          }}
        >
          <div className="flex items-center gap-2 mb-1">
            <Users size={14} className="text-white/60" />
            <span className="text-[10px] font-bold uppercase tracking-[1px] text-white/60">Family Net Worth</span>
          </div>
          <p className="font-head text-[28px] font-bold text-white leading-tight">
            {fmt(netWorth)}
          </p>
          <div className="flex items-center gap-3 mt-2">
            <span
              className="text-[11px] font-bold px-2 py-[2px] rounded"
              style={{
                background: positive ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                color: positive ? '#6ee7b7' : '#fca5a5',
              }}
            >
              {positive ? '+' : ''}{totalChange.toFixed(2)}%
            </span>
            <span className="text-[11px] text-white/50">
              {members.length} family member{members.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* ── Member Cards ── */}
      <div className="px-5 pt-4 flex flex-col gap-2.5">
        <p className="text-[10px] font-bold uppercase tracking-[0.8px]" style={{ color: 'var(--text-3)' }}>Members</p>
        {members.map(m => (
          <MemberCard
            key={m.id}
            member={m}
            expanded={expandedId === m.id}
            onToggle={() => setExpandedId(expandedId === m.id ? null : m.id)}
            onRemove={handleRemove}
          />
        ))}
      </div>

      {/* ── Add Member Button ── */}
      <div className="px-5 pt-4">
        <button
          onClick={() => setShowAdd(true)}
          className="w-full h-11 rounded-md text-white font-head text-[14px] font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
          style={{ background: 'var(--navy)' }}
        >
          <Plus size={16} /> Add Family Member
        </button>
      </div>

      {/* ── Modal ── */}
      {showAdd && <AddMemberModal onClose={() => setShowAdd(false)} onAdd={handleAdd} />}
    </div>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Plus, Trophy, Calendar, Hash, Copy, X, UserPlus, Crown, Medal, Award } from 'lucide-react';
import PageHeader from '../components/shared/PageHeader';

const STORAGE_KEY = 'vifm-classrooms';

function loadClassrooms() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { return []; }
}

function saveClassrooms(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

const MOCK_STUDENTS = [
  { name: 'Aiman Sadeq', initials: 'AS', returnPct: 0, trades: 0, isYou: true },
  { name: 'Sara Al-Mansoori', initials: 'SM', returnPct: 8.3, trades: 15 },
  { name: 'Khalid Bin Rashid', initials: 'KR', returnPct: 6.1, trades: 22 },
  { name: 'Noura Al-Shehhi', initials: 'NS', returnPct: 4.7, trades: 9 },
  { name: 'Faisal Al-Dosari', initials: 'FD', returnPct: 3.2, trades: 18 },
  { name: 'Maryam Hassan', initials: 'MH', returnPct: 1.9, trades: 7 },
  { name: 'Youssef Bakri', initials: 'YB', returnPct: -0.5, trades: 12 },
  { name: 'Lina Al-Qurashi', initials: 'LQ', returnPct: -2.1, trades: 5 },
];

export default function ClassroomPage() {
  const navigate = useNavigate();
  const [classrooms, setClassrooms] = useState(loadClassrooms);
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [form, setForm] = useState({ name: '', professor: '', duration: '3months' });
  const [joinCode, setJoinCode] = useState('');

  function generateCode() {
    return 'VIFM-' + Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  function handleCreate(e) {
    e.preventDefault();
    const classroom = {
      id: Date.now(),
      name: form.name,
      professor: form.professor,
      code: generateCode(),
      duration: form.duration,
      createdAt: new Date().toISOString(),
      students: MOCK_STUDENTS,
      startingCash: 100000,
    };
    const updated = [...classrooms, classroom];
    setClassrooms(updated);
    saveClassrooms(updated);
    setShowCreate(false);
    setForm({ name: '', professor: '', duration: '3months' });
    setSelectedClass(classroom);
  }

  function handleJoin(e) {
    e.preventDefault();
    const classroom = {
      id: Date.now(),
      name: 'Financial Analysis 301',
      professor: 'Dr. Ahmed Al-Rashid',
      code: joinCode || 'VIFM-DEMO',
      duration: '3months',
      createdAt: new Date().toISOString(),
      students: MOCK_STUDENTS,
      startingCash: 100000,
      joined: true,
    };
    const updated = [...classrooms, classroom];
    setClassrooms(updated);
    saveClassrooms(updated);
    setShowJoin(false);
    setJoinCode('');
    setSelectedClass(classroom);
  }

  function copyCode(code) {
    navigator.clipboard?.writeText(code);
  }

  // Class detail view
  if (selectedClass) {
    const sorted = [...selectedClass.students].sort((a, b) => b.returnPct - a.returnPct);
    return (
      <div className="animate-fade-in" style={{ background: 'var(--bg)', minHeight: '100vh' }}>
        <PageHeader title={selectedClass.name} subtitle={`Professor: ${selectedClass.professor}`} backTo="/classroom" />
        <div className="px-4 py-4 space-y-4">
          {/* Class info card */}
          <div className="rounded-md p-4 text-white" style={{ background: 'var(--navy)' }}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-head text-[10px] font-bold uppercase tracking-[1px]" style={{ color: 'rgba(255,255,255,0.5)' }}>Class Code</p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-lg font-bold font-mono">{selectedClass.code}</p>
                  <button onClick={() => copyCode(selectedClass.code)} className="p-1 rounded" style={{ background: 'rgba(255,255,255,0.12)' }}>
                    <Copy size={12} />
                  </button>
                </div>
              </div>
              <div className="text-right">
                <p className="font-head text-[10px] font-bold uppercase tracking-[1px]" style={{ color: 'rgba(255,255,255,0.5)' }}>Students</p>
                <p className="text-lg font-bold mt-1">{selectedClass.students.length}</p>
              </div>
            </div>
            <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.45)' }}>Share this code with students to join the competition</p>
          </div>

          {/* Leaderboard */}
          <p className="font-head text-[11px] font-bold uppercase tracking-[1.2px]" style={{ color: 'var(--text-3)' }}>Class Rankings</p>
          <div className="space-y-2">
            {sorted.map((s, i) => {
              const rank = i + 1;
              const medalIcons = { 1: Crown, 2: Medal, 3: Award };
              const MedalIcon = medalIcons[rank];
              const medalColors = { 1: 'var(--ic-amber-fg)', 2: 'var(--text-3)', 3: '#CD7F32' };
              return (
                <div
                  key={s.initials}
                  className="rounded-md p-3 flex items-center gap-3"
                  style={{
                    background: s.isYou ? 'var(--blue-light)' : 'var(--card)',
                    border: s.isYou ? '1.5px solid var(--blue-mid)' : '1px solid var(--border)',
                  }}
                >
                  <div className="w-7 text-center flex-shrink-0">
                    {MedalIcon
                      ? <MedalIcon size={16} style={{ color: medalColors[rank] }} />
                      : <span className="text-sm font-bold" style={{ color: 'var(--text-3)' }}>#{rank}</span>
                    }
                  </div>
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{
                      background: s.isYou ? 'var(--navy)' : 'var(--bg)',
                      color: s.isYou ? '#fff' : 'var(--text-2)',
                    }}
                  >
                    <span className="text-[10px] font-bold">{s.initials}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-head text-[12px] font-bold truncate" style={{ color: 'var(--navy)' }}>{s.isYou ? 'You' : s.name}</p>
                    <p className="text-[10px]" style={{ color: 'var(--text-3)' }}>{s.trades} trades</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold tabular-nums" style={{ color: s.returnPct >= 0 ? 'var(--green)' : 'var(--red)' }}>
                      {s.returnPct >= 0 ? '+' : ''}{s.returnPct.toFixed(1)}%
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={() => navigate('/portfolio')}
            className="w-full py-2.5 rounded-md font-head text-[11px] font-semibold text-white transition-colors"
            style={{ background: 'var(--navy)' }}
          >
            Open Practice Portfolio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <PageHeader title="Classroom" subtitle="Compete with classmates" backTo="/learning" />

      <div className="px-4 py-4 space-y-4">
        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={() => setShowCreate(true)}
            className="rounded-md p-4 text-center transition-all hover:-translate-y-0.5"
            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
          >
            <div
              className="w-10 h-10 mx-auto rounded-md flex items-center justify-center mb-2"
              style={{ background: 'var(--ic-purple-bg)', color: 'var(--ic-purple-fg)' }}
            >
              <Plus size={18} />
            </div>
            <p className="font-head text-[12px] font-bold" style={{ color: 'var(--navy)' }}>Create Class</p>
            <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-3)' }}>For professors</p>
          </button>
          <button
            onClick={() => setShowJoin(true)}
            className="rounded-md p-4 text-center transition-all hover:-translate-y-0.5"
            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
          >
            <div
              className="w-10 h-10 mx-auto rounded-md flex items-center justify-center mb-2"
              style={{ background: 'var(--ic-green-bg)', color: 'var(--ic-green-fg)' }}
            >
              <UserPlus size={18} />
            </div>
            <p className="font-head text-[12px] font-bold" style={{ color: 'var(--navy)' }}>Join Class</p>
            <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-3)' }}>Enter class code</p>
          </button>
        </div>

        {/* Existing classrooms */}
        {classrooms.length > 0 && (
          <>
            <p className="font-head text-[11px] font-bold uppercase tracking-[1.2px]" style={{ color: 'var(--text-3)' }}>Your Classes</p>
            <div className="space-y-2.5">
              {classrooms.map(c => (
                <button
                  key={c.id}
                  onClick={() => setSelectedClass(c)}
                  className="rounded-md w-full text-left p-3.5 flex items-center gap-3.5 transition-all hover:-translate-y-0.5"
                  style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
                >
                  <div
                    className="w-10 h-10 rounded-md flex items-center justify-center flex-shrink-0"
                    style={{ background: 'var(--ic-purple-bg)', color: 'var(--ic-purple-fg)' }}
                  >
                    <Users size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-head text-sm font-bold truncate" style={{ color: 'var(--navy)' }}>{c.name}</p>
                    <p className="text-[10px]" style={{ color: 'var(--text-3)' }}>{c.professor} &middot; {c.students.length} students</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-mono font-semibold" style={{ color: 'var(--blue)' }}>{c.code}</p>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}

        {classrooms.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12">
            <div
              className="w-14 h-14 rounded-md flex items-center justify-center mb-4"
              style={{ background: 'var(--ic-purple-bg)', color: 'var(--ic-purple-fg)' }}
            >
              <Users size={22} strokeWidth={1.8} />
            </div>
            <p className="font-head text-md font-bold mb-1" style={{ color: 'var(--navy)' }}>No classes yet</p>
            <p className="text-[11px] text-center max-w-[240px]" style={{ color: 'var(--text-3)' }}>
              Create a class as a professor or join one with a class code.
            </p>
          </div>
        )}
      </div>

      {/* Create Class Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ background: 'rgba(1,1,49,0.35)' }} onClick={() => setShowCreate(false)}>
          <div
            className="w-full max-w-[430px] p-5 animate-slide-up"
            style={{ background: 'var(--card)', borderRadius: '20px 20px 0 0' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-head text-sm font-bold" style={{ color: 'var(--navy)' }}>Create Class</h3>
              <button onClick={() => setShowCreate(false)} className="p-1 rounded-md" style={{ color: 'var(--text-3)' }}><X size={16} /></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="font-head text-[10px] font-bold uppercase tracking-[1px] block mb-1.5" style={{ color: 'var(--text-3)' }}>Class Name</label>
                <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Financial Analysis 301" required
                  className="w-full text-[12px] font-body rounded-md px-3 py-2.5 focus:outline-none"
                  style={{ border: '1px solid var(--border)', color: 'var(--navy)' }}
                />
              </div>
              <div>
                <label className="font-head text-[10px] font-bold uppercase tracking-[1px] block mb-1.5" style={{ color: 'var(--text-3)' }}>Professor Name</label>
                <input type="text" value={form.professor} onChange={e => setForm(f => ({ ...f, professor: e.target.value }))} placeholder="e.g. Dr. Ahmed" required
                  className="w-full text-[12px] font-body rounded-md px-3 py-2.5 focus:outline-none"
                  style={{ border: '1px solid var(--border)', color: 'var(--navy)' }}
                />
              </div>
              <div>
                <label className="font-head text-[10px] font-bold uppercase tracking-[1px] block mb-1.5" style={{ color: 'var(--text-3)' }}>Competition Duration</label>
                <select value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))}
                  className="w-full text-[12px] font-body rounded-md px-3 py-2.5 focus:outline-none"
                  style={{ border: '1px solid var(--border)', color: 'var(--navy)', background: 'var(--card)' }}
                >
                  <option value="1month">1 Month</option>
                  <option value="3months">3 Months (Semester)</option>
                  <option value="6months">6 Months</option>
                  <option value="1year">1 Year</option>
                </select>
              </div>
              <button type="submit"
                className="w-full py-2.5 rounded-md font-head text-[11px] font-semibold text-white transition-colors"
                style={{ background: 'var(--navy)' }}
              >
                Create & Get Code
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Join Class Modal */}
      {showJoin && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ background: 'rgba(1,1,49,0.35)' }} onClick={() => setShowJoin(false)}>
          <div
            className="w-full max-w-[430px] p-5 animate-slide-up"
            style={{ background: 'var(--card)', borderRadius: '20px 20px 0 0' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-head text-sm font-bold" style={{ color: 'var(--navy)' }}>Join Class</h3>
              <button onClick={() => setShowJoin(false)} className="p-1 rounded-md" style={{ color: 'var(--text-3)' }}><X size={16} /></button>
            </div>
            <form onSubmit={handleJoin} className="space-y-4">
              <div>
                <label className="font-head text-[10px] font-bold uppercase tracking-[1px] block mb-1.5" style={{ color: 'var(--text-3)' }}>Class Code</label>
                <input type="text" value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())} placeholder="VIFM-XXXXXX" required
                  className="w-full text-sm font-mono rounded-md px-3 py-3 focus:outline-none text-center tracking-widest"
                  style={{ border: '1px solid var(--border)', color: 'var(--navy)' }}
                />
              </div>
              <button type="submit"
                className="w-full py-2.5 rounded-md font-head text-[11px] font-semibold text-white transition-colors"
                style={{ background: 'var(--green)' }}
              >
                Join Competition
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

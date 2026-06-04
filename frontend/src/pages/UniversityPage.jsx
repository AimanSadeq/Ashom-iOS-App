import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin, Building2, UserPlus,
  CheckCircle, Clock, XCircle, LogOut
} from 'lucide-react';

import PageHeader from '../components/shared/PageHeader';
import LoadingState from '../components/shared/LoadingState';
import ErrorState from '../components/shared/ErrorState';
import useApi from '../hooks/useApi';
import { university } from '../services/api';

const STORAGE_KEY = 'vifm_university_enrollment';

const FALLBACK_UNIVERSITIES = [
  { id: 'kfupm', name: 'KFUPM', full_name: 'King Fahd University of Petroleum and Minerals', country: 'Saudi Arabia', country_code: 'SA', description: 'Premier engineering and business university with a strong finance and economics program.', programs: ['Finance BSc', 'MBA Finance', 'MSc Economics'], accent_color: '#00C896' },
  { id: 'aus', name: 'American University of Sharjah', full_name: 'American University of Sharjah', country: 'UAE', country_code: 'AE', description: 'AACSB-accredited with finance concentrations emphasizing quantitative methods and capital markets.', programs: ['BBA Finance', 'MBA', 'MSc Finance'], accent_color: '#5391D5' },
  { id: 'qu', name: 'Qatar University', full_name: 'Qatar University', country: 'Qatar', country_code: 'QA', description: 'Qatar\'s largest university with a dedicated finance department and strong research output.', programs: ['BSc Finance', 'MSc Finance', 'PhD Economics'], accent_color: '#8B5CF6' },
  { id: 'uob', name: 'University of Bahrain', full_name: 'University of Bahrain', country: 'Bahrain', country_code: 'BH', description: 'Bahrain\'s national university offering finance and banking programs.', programs: ['BSc Finance', 'MBA Banking'], accent_color: '#EC4899' },
  { id: 'ku', name: 'Kuwait University', full_name: 'Kuwait University', country: 'Kuwait', country_code: 'KW', description: 'Kuwait\'s oldest university with a finance and financial institutions department.', programs: ['BSc Finance', 'MSc Finance'], accent_color: '#F59E0B' },
  { id: 'squ', name: 'Sultan Qaboos University', full_name: 'Sultan Qaboos University', country: 'Oman', country_code: 'OM', description: 'Oman\'s leading university with programs in financial economics and quantitative analysis.', programs: ['BSc Economics', 'MSc Finance'], accent_color: '#EF4444' },
];

const PROGRAMS = ['BSc Finance', 'BBA Finance', 'MSc Finance', 'MBA Finance', 'PhD Economics', 'CFA Candidate', 'Professional'];

function getLocalEnrollment() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || null; } catch { return null; }
}

const st = {
  card: { background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)' },
  sectionLabel: {
    fontFamily: 'var(--font-head)', fontSize: 11, fontWeight: 700,
    textTransform: 'uppercase', letterSpacing: '1.2px', color: 'var(--text-3)',
    marginBottom: 10,
  },
  input: {
    width: '100%', padding: '10px 12px', fontSize: 16, border: '1px solid var(--border)',
    borderRadius: 'var(--r-sm)', outline: 'none', background: 'var(--card)',
    color: 'var(--text-1)', fontFamily: 'var(--font-body)',
  },
  label: {
    fontSize: 10, fontWeight: 600, color: 'var(--text-3)',
    textTransform: 'uppercase', letterSpacing: '0.8px', display: 'block', marginBottom: 4,
    fontFamily: 'var(--font-head)',
  },
};

export default function UniversityPage() {
  const navigate = useNavigate();
  const { data: uniData, loading: uniLoading, error: uniError } = useApi(university.partners);

  const unis = (Array.isArray(uniData) ? uniData : uniData?.partners || []);
  const uniList = unis.length > 0 ? unis : FALLBACK_UNIVERSITIES;

  const [enrollment, setEnrollment] = useState(getLocalEnrollment);
  const [enrollForm, setEnrollForm] = useState({ name: '', email: '', university: '', program: '', studentId: '' });
  const [enrolling, setEnrolling] = useState(false);
  const [enrollError, setEnrollError] = useState(null);

  async function handleEnroll(e) {
    e.preventDefault();
    if (!enrollForm.name || !enrollForm.email || !enrollForm.university) return;
    setEnrolling(true);
    setEnrollError(null);

    try {
      const res = await university.enroll({
        universityId: enrollForm.university,
        fullName: enrollForm.name,
        email: enrollForm.email,
        studentId: enrollForm.studentId || null,
        program: enrollForm.program || 'General',
      });
      if (res.success && res.enrollment) {
        const data = { ...res.enrollment, _fromServer: true };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        setEnrollment(data);
      }
    } catch {
      const uniObj = uniList.find(u => u.id === enrollForm.university);
      const data = {
        full_name: enrollForm.name,
        email: enrollForm.email,
        university_id: enrollForm.university,
        universityName: uniObj?.full_name || uniObj?.name || enrollForm.university,
        program: enrollForm.program || 'General',
        student_id: enrollForm.studentId,
        verification_status: 'pending',
        enrolled_at: new Date().toISOString(),
        _fromServer: false,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      setEnrollment(data);
    } finally {
      setEnrolling(false);
    }
  }

  function handleUnenroll() {
    localStorage.removeItem(STORAGE_KEY);
    setEnrollment(null);
  }

  const statusColors = {
    pending: { bg: '#FFF7ED', text: '#D97706', border: '#FDE68A', icon: Clock },
    verified: { bg: 'var(--green-bg)', text: 'var(--green)', border: '#A7F3D0', icon: CheckCircle },
    rejected: { bg: 'var(--red-bg)', text: 'var(--red)', border: '#FECACA', icon: XCircle },
  };

  return (
    <div>
      <PageHeader title="University Programs" subtitle="VIFM Academic Partners" backTo="/learning" />

      {/* Hero */}
      <div style={{ padding: '16px 20px', background: 'var(--card)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          <div style={{ width: 40, height: 40, borderRadius: 'var(--r-sm)', background: 'var(--blue-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Building2 size={18} style={{ color: 'var(--blue)' }} />
          </div>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--navy)', fontFamily: 'var(--font-head)' }}>VIFM Academic Programs</h2>
            <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>Partner with leading GCC universities to bring real quantitative finance tools into the classroom</p>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8 }}>
          {[
            { value: uniList.length, label: 'Partners' },
            { value: 6, label: 'Courses' },
            { value: 40, label: 'Guided Steps' },
            { value: enrollment ? 1 : 0, label: 'Enrolled' },
          ].map(s => (
            <div key={s.label} style={{ ...st.card, padding: '10px 8px', textAlign: 'center' }}>
              <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--navy)', fontFamily: 'var(--font-head)' }}>{s.value}</p>
              <p style={{ fontSize: 9, color: 'var(--text-3)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.8px', fontFamily: 'var(--font-head)' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 24 }}>
        {uniLoading && <LoadingState message="Loading programs..." />}

        {/* Partner Universities */}
        <section>
          <p style={st.sectionLabel}>Partner Universities</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {uniList.map((u, i) => {
              const initial = (u.name || 'U').charAt(0);
              const color = u.accent_color || '#7C3AED';
              const programs = Array.isArray(u.programs) ? u.programs : [];
              return (
                <div key={u.id || i} style={{ ...st.card, padding: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 'var(--r-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0, fontSize: 14, fontWeight: 700, background: color + '1A', color,
                      fontFamily: 'var(--font-head)',
                    }}>
                      {initial}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--navy)', fontFamily: 'var(--font-head)' }}>{u.full_name || u.name}</h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 3 }}>
                        <MapPin size={10} style={{ color: 'var(--text-3)' }} />
                        <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{u.country}</span>
                        {u.country_code && (
                          <span style={{ marginLeft: 4, fontSize: 10, fontWeight: 700, color: 'var(--blue)', background: 'var(--blue-light)', padding: '1px 6px', borderRadius: 4 }}>
                            {u.country_code}
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 6, lineHeight: 1.5 }}>{u.description}</p>
                      {programs.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 8 }}>
                          {programs.map(p => (
                            <span key={p} style={{
                              fontSize: 10, padding: '3px 10px', borderRadius: 20,
                              background: 'var(--blue-light)', color: 'var(--blue)', fontWeight: 500,
                            }}>{p}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Enrollment */}
        <section>
          {enrollment ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <p style={st.sectionLabel}>Your Enrollment</p>
              <div style={{ ...st.card, padding: 16 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                  <div>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--navy)', fontFamily: 'var(--font-head)' }}>{enrollment.full_name || enrollment.name}</h3>
                    <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>
                      {enrollment.universityName || enrollment.university_id} -- {enrollment.program || 'General'}
                    </p>
                  </div>
                  {(() => {
                    const status = enrollment.verification_status || 'pending';
                    const sc = statusColors[status] || statusColors.pending;
                    const StatusIcon = sc.icon;
                    return (
                      <span style={{
                        display: 'flex', alignItems: 'center', gap: 4,
                        fontSize: 10, fontWeight: 600, padding: '4px 10px', borderRadius: 20,
                        background: sc.bg, color: sc.text, border: `1px solid ${sc.border}`,
                      }}>
                        <StatusIcon size={10} /> {status}
                      </span>
                    );
                  })()}
                </div>
                <p style={{ ...st.sectionLabel, marginTop: 16 }}>Course Progress</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[
                    { id: 'investment', name: 'Investment Analysis', total_steps: 14 },
                    { id: 'portfolio', name: 'Portfolio Management', total_steps: 7 },
                    { id: 'corporate', name: 'Corporate Finance', total_steps: 7 },
                    { id: 'econometrics', name: 'Financial Econometrics', total_steps: 6 },
                    { id: 'gcc', name: 'GCC Capital Markets', total_steps: 6 },
                  ].map(c => {
                    const pct = 0;
                    return (
                      <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <p style={{ fontSize: 11, color: 'var(--navy)', fontWeight: 500, width: 112, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</p>
                        <div style={{ flex: 1, height: 6, background: 'var(--bg)', borderRadius: 20, overflow: 'hidden' }}>
                          <div style={{ height: '100%', background: 'var(--green)', borderRadius: 20, transition: 'width 0.3s', width: `${pct}%` }} />
                        </div>
                        <span style={{ fontSize: 11, color: 'var(--text-3)', fontVariantNumeric: 'tabular-nums', width: 32, textAlign: 'right' }}>{pct}%</span>
                      </div>
                    );
                  })}
                </div>
                <button onClick={handleUnenroll}
                  style={{
                    marginTop: 16, display: 'flex', alignItems: 'center', gap: 6,
                    fontSize: 11, fontWeight: 600, color: 'var(--red)', background: 'transparent',
                    border: 'none', cursor: 'pointer', padding: 0,
                  }}>
                  <LogOut size={10} /> Unenroll
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <p style={{ ...st.sectionLabel, display: 'flex', alignItems: 'center', gap: 4 }}>
                <UserPlus size={12} style={{ color: '#7C3AED' }} /> Enroll in Academic Program
              </p>
              <form onSubmit={handleEnroll} style={{ ...st.card, padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <label style={st.label}>Full Name</label>
                  <input type="text" required value={enrollForm.name} onChange={e => setEnrollForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="Enter your full name" style={st.input} />
                </div>
                <div>
                  <label style={st.label}>University Email</label>
                  <input type="email" required value={enrollForm.email} onChange={e => setEnrollForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="your.name@university.edu" style={st.input} />
                </div>
                <div>
                  <label style={st.label}>University</label>
                  <select required value={enrollForm.university} onChange={e => setEnrollForm(f => ({ ...f, university: e.target.value }))}
                    style={{ ...st.input, appearance: 'auto' }}>
                    <option value="">Select university...</option>
                    {uniList.map(u => <option key={u.id} value={u.id}>{u.full_name || u.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={st.label}>Program</label>
                  <select value={enrollForm.program} onChange={e => setEnrollForm(f => ({ ...f, program: e.target.value }))}
                    style={{ ...st.input, appearance: 'auto' }}>
                    <option value="">Select program...</option>
                    {PROGRAMS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label style={st.label}>Student / Employee ID <span style={{ color: 'var(--text-3)' }}>(optional)</span></label>
                  <input type="text" value={enrollForm.studentId} onChange={e => setEnrollForm(f => ({ ...f, studentId: e.target.value }))}
                    placeholder="Optional" style={st.input} />
                </div>
                {enrollError && <p style={{ fontSize: 11, color: 'var(--red)' }}>{enrollError}</p>}
                <button type="submit" disabled={enrolling}
                  style={{
                    width: '100%', padding: '12px 0', borderRadius: 'var(--r-md)',
                    background: 'var(--navy)', color: '#fff', fontSize: 14, fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    border: 'none', cursor: 'pointer', fontFamily: 'var(--font-head)',
                    opacity: enrolling ? 0.5 : 1, transition: 'opacity 0.15s',
                  }}>
                  {enrolling ? <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%' }} className="animate-spin" /> : <><UserPlus size={14} /> Enroll Now</>}
                </button>
              </form>
            </div>
          )}
        </section>
      </div>

      <div style={{ height: 24 }} />
    </div>
  );
}

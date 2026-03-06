import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';

// ─── Global Styles ────────────────────────────────────────────────────────────
const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
  * { box-sizing: border-box; }
  body, #root { font-family: 'Plus Jakarta Sans', sans-serif; background: #f0f4ff; margin: 0; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes scaleIn {
    from { opacity: 0; transform: scale(0.93); }
    to   { opacity: 1; transform: scale(1); }
  }
  @keyframes gradientShift {
    0%   { background-position: 0% 50%; }
    50%  { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  @keyframes orb1 {
    0%,100% { transform: translate(0,0) scale(1); }
    50%      { transform: translate(40px,-25px) scale(1.07); }
  }
  @keyframes orb2 {
    0%,100% { transform: translate(0,0) scale(1); }
    50%      { transform: translate(-30px,30px) scale(0.94); }
  }
  @keyframes float {
    0%,100% { transform: translateY(0px); }
    50%      { transform: translateY(-8px); }
  }
  @keyframes particleFloat {
    0%   { transform: translateY(0) scale(1); opacity: 0.5; }
    100% { transform: translateY(-110px) scale(0); opacity: 0; }
  }
  @keyframes shimmerPulse {
    0%,100% { opacity: 1; }
    50%      { opacity: 0.45; }
  }
  @keyframes tabSlide {
    from { opacity: 0; transform: translateX(12px); }
    to   { opacity: 1; transform: translateX(0); }
  }

  .glass {
    background: rgba(255,255,255,0.9);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
  }
  .gradient-btn {
    background: linear-gradient(135deg, #1d4ed8, #3b82f6, #6366f1);
    background-size: 200% auto;
    transition: background-position 0.4s, transform 0.2s, box-shadow 0.2s;
  }
  .gradient-btn:hover:not(:disabled) {
    background-position: right center;
    transform: translateY(-2px);
    box-shadow: 0 10px 28px rgba(59,130,246,0.4);
  }
  .gradient-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .input-glow:focus {
    border-color: #3b82f6 !important;
    box-shadow: 0 0 0 4px rgba(59,130,246,0.12);
    outline: none;
  }
  .tab-btn {
    transition: all 0.25s ease;
  }
  .form-slide {
    animation: tabSlide 0.3s cubic-bezier(.22,1,.36,1) both;
  }
`;

// ─── Background Orbs ─────────────────────────────────────────────────────────
function BgOrbs() {
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
      <div style={{
        position: 'absolute', top: '-10%', right: '-5%',
        width: 500, height: 500, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)',
        animation: 'orb1 11s ease-in-out infinite',
      }} />
      <div style={{
        position: 'absolute', bottom: '5%', left: '-6%',
        width: 400, height: 400, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 70%)',
        animation: 'orb2 14s ease-in-out infinite',
      }} />
    </div>
  );
}

// ─── Floating Particles ───────────────────────────────────────────────────────
function Particles() {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {[...Array(7)].map((_, i) => (
        <div key={i} style={{
          position: 'absolute',
          width: `${5 + i * 2}px`, height: `${5 + i * 2}px`,
          borderRadius: '50%',
          background: `rgba(255,255,255,${0.1 + i * 0.04})`,
          left: `${8 + i * 13}%`, bottom: 0,
          animation: `particleFloat ${3 + i * 0.6}s ease-out ${i * 0.35}s infinite`,
        }} />
      ))}
    </div>
  );
}

// ─── Shared input style ───────────────────────────────────────────────────────
const inputStyle = {
  width: '100%',
  border: '1.5px solid #e2e8f0',
  borderRadius: 12,
  padding: '11px 14px',
  fontSize: 14,
  background: '#fff',
  fontFamily: 'Plus Jakarta Sans, sans-serif',
  color: '#1e293b',
  transition: 'border-color 0.2s, box-shadow 0.2s',
};

const labelStyle = {
  display: 'block',
  fontSize: 12.5,
  fontWeight: 700,
  color: '#374151',
  marginBottom: 7,
};

// ─── Error box ───────────────────────────────────────────────────────────────
function ErrBox({ msg }) {
  if (!msg) return null;
  return (
    <div style={{
      background: '#fef2f2', border: '1px solid #fecaca',
      color: '#dc2626', borderRadius: 12,
      padding: '11px 14px', fontSize: 13, marginBottom: 18,
      display: 'flex', alignItems: 'center', gap: 7,
      animation: 'scaleIn 0.3s ease both',
    }}>
      ⚠️ {msg}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// RECRUITER LOGIN — original logic, just re-styled
// ═════════════════════════════════════════════════════════════════════════════
function RecruiterLogin() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Original handleSubmit — untouched logic
  const handleSubmit = async (e) => {
    e.preventDefault(); setErr(''); setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      login(data.user, data.token);
      navigate('/recruiter/dashboard');
    } catch (e) {
      setErr(e.response?.data?.error || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="form-slide" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <ErrBox msg={err} />
      <div>
        <label style={labelStyle}>✉️ Email</label>
        <input
          className="input-glow"
          type="email"
          placeholder="recruiter@ahis.com"
          value={form.email}
          onChange={e => setForm({ ...form, email: e.target.value })}
          required
          style={inputStyle}
        />
      </div>
      <div>
        <label style={labelStyle}>🔒 Password</label>
        <input
          className="input-glow"
          type="password"
          placeholder="••••••••"
          value={form.password}
          onChange={e => setForm({ ...form, password: e.target.value })}
          required
          style={inputStyle}
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="gradient-btn"
        style={{
          width: '100%', color: '#fff', border: 'none',
          padding: '13px', borderRadius: 12, marginTop: 4,
          fontFamily: 'Plus Jakarta Sans, sans-serif',
          fontSize: 14, fontWeight: 700, cursor: 'pointer',
        }}
      >
        {loading ? 'Signing in…' : 'Sign In →'}
      </button>
      <p style={{ textAlign: 'center', fontSize: 11.5, color: '#94a3b8', marginTop: 4 }}>
        First time? Run <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: 4 }}>POST /api/auth/seed</code>
      </p>
    </form>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// CANDIDATE LOGIN
// ═════════════════════════════════════════════════════════════════════════════
function CandidateLogin() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault(); setErr(''); setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      // Ensure only candidates can log in here
      if (data.user.role !== 'candidate') {
        setErr('This login is for candidates only. Use the Recruiter tab.');
        return;
      }
      login(data.user, data.token);
      navigate('/');
    } catch (e) {
      setErr(e.response?.data?.error || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="form-slide" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <ErrBox msg={err} />
      <div>
        <label style={labelStyle}>✉️ Email</label>
        <input
          className="input-glow"
          type="email"
          placeholder="jane@example.com"
          value={form.email}
          onChange={e => setForm({ ...form, email: e.target.value })}
          required
          style={inputStyle}
        />
      </div>
      <div>
        <label style={labelStyle}>🔒 Password</label>
        <input
          className="input-glow"
          type="password"
          placeholder="••••••••"
          value={form.password}
          onChange={e => setForm({ ...form, password: e.target.value })}
          required
          style={inputStyle}
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="gradient-btn"
        style={{
          width: '100%', color: '#fff', border: 'none',
          padding: '13px', borderRadius: 12, marginTop: 4,
          fontFamily: 'Plus Jakarta Sans, sans-serif',
          fontSize: 14, fontWeight: 700, cursor: 'pointer',
        }}
      >
        {loading ? 'Signing in…' : 'Sign In →'}
      </button>
      <p style={{ textAlign: 'center', fontSize: 12.5, color: '#64748b' }}>
        No account?{' '}
        <span
          style={{ color: '#3b82f6', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
          onClick={() => {/* parent will switch to register — handled via prop */
            document.dispatchEvent(new CustomEvent('switchToRegister'));
          }}
        >
          Create one free →
        </span>
      </p>
    </form>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// CANDIDATE REGISTER — NEW, uses POST /api/auth/register
// ═════════════════════════════════════════════════════════════════════════════
function CandidateRegister({ onSwitchToLogin }) {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault(); setErr(''); 
    if (form.password !== form.confirm) {
      setErr('Passwords do not match'); return;
    }
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', {
        name: form.name,
        email: form.email,
        password: form.password,
      });
      login(data.user, data.token);
      navigate('/');
    } catch (e) {
      setErr(e.response?.data?.error || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="form-slide" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <ErrBox msg={err} />
      <div>
        <label style={labelStyle}>👤 Full Name</label>
        <input
          className="input-glow"
          placeholder="Jane Doe"
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
          required
          style={inputStyle}
        />
      </div>
      <div>
        <label style={labelStyle}>✉️ Email</label>
        <input
          className="input-glow"
          type="email"
          placeholder="jane@example.com"
          value={form.email}
          onChange={e => setForm({ ...form, email: e.target.value })}
          required
          style={inputStyle}
        />
      </div>
      <div>
        <label style={labelStyle}>🔒 Password</label>
        <input
          className="input-glow"
          type="password"
          placeholder="At least 6 characters"
          value={form.password}
          onChange={e => setForm({ ...form, password: e.target.value })}
          required
          style={inputStyle}
        />
      </div>
      <div>
        <label style={labelStyle}>🔒 Confirm Password</label>
        <input
          className="input-glow"
          type="password"
          placeholder="Re-enter password"
          value={form.confirm}
          onChange={e => setForm({ ...form, confirm: e.target.value })}
          required
          style={inputStyle}
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="gradient-btn"
        style={{
          width: '100%', color: '#fff', border: 'none',
          padding: '13px', borderRadius: 12, marginTop: 4,
          fontFamily: 'Plus Jakarta Sans, sans-serif',
          fontSize: 14, fontWeight: 700, cursor: 'pointer',
        }}
      >
        {loading ? 'Creating account…' : 'Create Account →'}
      </button>
      <p style={{ textAlign: 'center', fontSize: 12.5, color: '#64748b' }}>
        Already have an account?{' '}
        <span
          style={{ color: '#3b82f6', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
          onClick={onSwitchToLogin}
        >
          Sign in
        </span>
      </p>
    </form>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// MAIN LOGIN PAGE
// ═════════════════════════════════════════════════════════════════════════════
export function LoginPage() {
  // 'recruiter' | 'candidate-login' | 'candidate-register'
  const [tab, setTab] = useState('recruiter');

  // Listen for the "Create one free" click from CandidateLogin
  React.useEffect(() => {
    const handler = () => setTab('candidate-register');
    document.addEventListener('switchToRegister', handler);
    return () => document.removeEventListener('switchToRegister', handler);
  }, []);

  const isCandidate = tab === 'candidate-login' || tab === 'candidate-register';

  const tabTitle = {
    'recruiter':           'Recruiter Login',
    'candidate-login':     'Candidate Login',
    'candidate-register':  'Create Account',
  }[tab];

  const tabSub = {
    'recruiter':           'Access your hiring dashboard',
    'candidate-login':     'Sign in to browse & apply for jobs',
    'candidate-register':  'Join AHIS and start applying today',
  }[tab];

  return (
    <>
      <style>{globalStyles}</style>
      <BgOrbs />

      <div style={{
        minHeight: '100vh',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20, position: 'relative', zIndex: 1,
      }}>
        <div
          className="glass"
          style={{
            borderRadius: 24,
            width: '100%', maxWidth: 460,
            overflow: 'hidden',
            boxShadow: '0 24px 80px rgba(59,130,246,0.14)',
            border: '1px solid rgba(59,130,246,0.1)',
            animation: 'scaleIn 0.45s cubic-bezier(.22,1,.36,1) both',
          }}
        >
          {/* ── Gradient header banner ── */}
          <div style={{
            background: 'linear-gradient(135deg,#1e3a8a,#1d4ed8,#4f46e5)',
            backgroundSize: '200% 200%',
            animation: 'gradientShift 7s ease infinite',
            padding: '28px 28px 24px',
            position: 'relative', overflow: 'hidden',
          }}>
            <Particles />
            <div style={{ position: 'absolute', top:-50, right:-50, width:180, height:180, borderRadius:'50%', border:'1px solid rgba(255,255,255,0.07)' }} />
            <div style={{ position: 'relative', textAlign: 'center' }}>
              {/* Logo */}
              <div style={{
                width: 54, height: 54, borderRadius: 16,
                background: 'rgba(255,255,255,0.18)',
                backdropFilter: 'blur(10px)',
                border: '2px solid rgba(255,255,255,0.28)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'Syne, sans-serif', fontSize: 24, fontWeight: 800, color: '#fff',
                margin: '0 auto 14px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                animation: 'float 5s ease-in-out infinite',
              }}>
                A
              </div>
              <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 4 }}>
                AHIS
              </h1>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>
                Autonomous Hiring Intelligence System
              </p>
            </div>
          </div>

          {/* ── Role tabs ── */}
          <div style={{
            display: 'flex',
            background: '#f8fafc',
            borderBottom: '1px solid #f1f5f9',
            padding: '10px 20px 0',
            gap: 4,
          }}>
            {/* Recruiter tab */}
            <button
              className="tab-btn"
              onClick={() => setTab('recruiter')}
              style={{
                flex: 1, padding: '10px 6px',
                borderRadius: '10px 10px 0 0',
                border: 'none', cursor: 'pointer',
                fontFamily: 'Plus Jakarta Sans, sans-serif',
                fontSize: 13, fontWeight: 700,
                background: tab === 'recruiter' ? '#fff' : 'transparent',
                color: tab === 'recruiter' ? '#1d4ed8' : '#94a3b8',
                borderBottom: tab === 'recruiter' ? '2px solid #3b82f6' : '2px solid transparent',
                boxShadow: tab === 'recruiter' ? '0 -2px 12px rgba(59,130,246,0.08)' : 'none',
              }}
            >
              🏢 Recruiter
            </button>

            {/* Candidate tab */}
            <button
              className="tab-btn"
              onClick={() => setTab('candidate-login')}
              style={{
                flex: 1, padding: '10px 6px',
                borderRadius: '10px 10px 0 0',
                border: 'none', cursor: 'pointer',
                fontFamily: 'Plus Jakarta Sans, sans-serif',
                fontSize: 13, fontWeight: 700,
                background: isCandidate ? '#fff' : 'transparent',
                color: isCandidate ? '#1d4ed8' : '#94a3b8',
                borderBottom: isCandidate ? '2px solid #3b82f6' : '2px solid transparent',
                boxShadow: isCandidate ? '0 -2px 12px rgba(59,130,246,0.08)' : 'none',
              }}
            >
              👤 Candidate
            </button>
          </div>

          {/* ── Form body ── */}
          <div style={{ padding: '26px 28px 28px' }}>
            {/* Section title */}
            <div style={{ marginBottom: 22 }}>
              <h2 style={{
                fontFamily: 'Syne, sans-serif', fontSize: 18, fontWeight: 800,
                color: '#1e293b', marginBottom: 4,
              }}>
                {tabTitle}
              </h2>
              <p style={{ fontSize: 13, color: '#64748b' }}>{tabSub}</p>
            </div>

            {/* Recruiter form */}
            {tab === 'recruiter' && <RecruiterLogin />}

            {/* Candidate login form */}
            {tab === 'candidate-login' && <CandidateLogin />}

            {/* Candidate register form */}
            {tab === 'candidate-register' && (
              <CandidateRegister onSwitchToLogin={() => setTab('candidate-login')} />
            )}
          </div>

          {/* ── Footer ── */}
          <div style={{
            padding: '12px 28px 18px',
            borderTop: '1px solid #f1f5f9',
            textAlign: 'center',
          }}>
            {isCandidate && tab !== 'candidate-register' ? (
              <p style={{ fontSize: 12, color: '#94a3b8' }}>
                Want to browse jobs without logging in?{' '}
                <Link to="/" style={{ color: '#3b82f6', fontWeight: 700, textDecoration: 'none' }}>
                  Go to job board →
                </Link>
              </p>
            ) : tab === 'candidate-register' ? (
              <p style={{ fontSize: 12, color: '#94a3b8' }}>
                By registering, you agree to our terms of service.
              </p>
            ) : (
              <p style={{ fontSize: 12, color: '#94a3b8' }}>
                Powered by local BERT · Zero API costs
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default LoginPage;
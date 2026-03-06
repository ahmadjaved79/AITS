import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api';

// ─── Global Styles ────────────────────────────────────────────────────────────
const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
  * { box-sizing: border-box; }
  body, #root { font-family: 'Plus Jakarta Sans', sans-serif; background: #f0f4ff; margin: 0; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes scaleIn {
    from { opacity: 0; transform: scale(0.94); }
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
    0%,100% { transform: translateY(0); }
    50%      { transform: translateY(-8px); }
  }
  @keyframes particleFloat {
    0%   { transform: translateY(0) scale(1); opacity: 0.5; }
    100% { transform: translateY(-100px) scale(0); opacity: 0; }
  }
  @keyframes rowReveal {
    from { opacity: 0; transform: translateX(-10px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes shimmerPulse {
    0%,100% { opacity: 1; }
    50%      { opacity: 0.45; }
  }
  @keyframes modalSlideUp {
    from { opacity: 0; transform: translateY(28px) scale(0.96); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes checkBounce {
    0%   { transform: scale(0.4) rotate(-10deg); opacity: 0; }
    60%  { transform: scale(1.15) rotate(3deg); opacity: 1; }
    100% { transform: scale(1) rotate(0deg); opacity: 1; }
  }
  @keyframes copyFlash {
    0%   { background-position: 0% 50%; }
    100% { background-position: 100% 50%; }
  }

  .glass {
    background: rgba(255,255,255,0.88);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
  }
  .card-hover {
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }
  .card-hover:hover {
    transform: translateY(-3px);
    box-shadow: 0 20px 50px rgba(59,130,246,0.12) !important;
  }
  .cand-row {
    transition: background 0.18s, transform 0.15s;
  }
  .cand-row:hover {
    background: rgba(59,130,246,0.035) !important;
    transform: translateX(2px);
  }
  .gradient-btn {
    background: linear-gradient(135deg, #1d4ed8, #3b82f6, #6366f1);
    background-size: 200% auto;
    transition: background-position 0.4s, transform 0.2s, box-shadow 0.2s;
  }
  .gradient-btn:hover {
    background-position: right center;
    transform: translateY(-2px);
    box-shadow: 0 10px 28px rgba(59,130,246,0.38);
  }
  .input-glow:focus {
    border-color: #3b82f6 !important;
    box-shadow: 0 0 0 4px rgba(59,130,246,0.12);
    outline: none;
  }
  .gen-btn {
    transition: all 0.2s ease;
  }
  .gen-btn:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 6px 18px rgba(168,85,247,0.3);
  }
`;

// ─── Background Orbs ─────────────────────────────────────────────────────────
function BgOrbs() {
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
      <div style={{
        position: 'absolute', top: '-8%', right: '-4%',
        width: 520, height: 520, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(59,130,246,0.07) 0%, transparent 70%)',
        animation: 'orb1 11s ease-in-out infinite',
      }} />
      <div style={{
        position: 'absolute', bottom: '5%', left: '-6%',
        width: 420, height: 420, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%)',
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

// ─── Score helpers ────────────────────────────────────────────────────────────
function scoreColor(s) {
  if (s == null || s === undefined) return '#94a3b8';
  return s >= 70 ? '#16a34a' : s >= 40 ? '#d97706' : '#dc2626';
}
function scoreBg(s) {
  if (s == null || s === undefined) return '#f8fafc';
  return s >= 70 ? '#f0fdf4' : s >= 40 ? '#fffbeb' : '#fef2f2';
}

// ─── Status style ─────────────────────────────────────────────────────────────
function statusStyle(status) {
  switch (status) {
    case 'validated': return { bg: '#f0fdf4', color: '#16a34a', dot: '#22c55e', label: 'Validated' };
    case 'invited':   return { bg: '#eff6ff', color: '#1d4ed8', dot: '#3b82f6', label: 'Invited'   };
    case 'processed': return { bg: '#faf5ff', color: '#7c3aed', dot: '#a855f7', label: 'Processed' };
    default:          return { bg: '#f8fafc', color: '#64748b', dot: '#cbd5e1', label: status      };
  }
}

// ─── Rank display ─────────────────────────────────────────────────────────────
function RankBadge({ i }) {
  if (i === 0) return <span style={{ fontSize: 20 }}>🥇</span>;
  if (i === 1) return <span style={{ fontSize: 20 }}>🥈</span>;
  if (i === 2) return <span style={{ fontSize: 20 }}>🥉</span>;
  return (
    <span style={{
      fontSize: 12, fontWeight: 700, color: '#94a3b8',
      background: '#f1f5f9', padding: '3px 8px', borderRadius: 8,
    }}>
      #{i + 1}
    </span>
  );
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
const avatarGradients = [
  'linear-gradient(135deg,#3b82f6,#1d4ed8)',
  'linear-gradient(135deg,#6366f1,#4f46e5)',
  'linear-gradient(135deg,#22c55e,#15803d)',
  'linear-gradient(135deg,#f97316,#c2410c)',
  'linear-gradient(135deg,#a855f7,#7c3aed)',
  'linear-gradient(135deg,#ec4899,#be185d)',
  'linear-gradient(135deg,#14b8a6,#0f766e)',
];

function Avatar({ name, index }) {
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div style={{
      width: 36, height: 36, borderRadius: '50%',
      background: avatarGradients[index % avatarGradients.length],
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontSize: 12, fontWeight: 700, flexShrink: 0,
      boxShadow: '0 4px 10px rgba(0,0,0,0.12)',
    }}>
      {initials}
    </div>
  );
}

// ─── Score Cell ───────────────────────────────────────────────────────────────
function ScoreCell({ value }) {
  const displayVal = value ?? '—';
  const color = scoreColor(value);
  const bg = scoreBg(value);
  return (
    <span style={{
      display: 'inline-block',
      fontFamily: 'Syne, sans-serif',
      fontSize: 14, fontWeight: 800,
      color,
      background: bg,
      padding: '3px 10px', borderRadius: 12,
      minWidth: 40, textAlign: 'center',
    }}>
      {displayVal}
    </span>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
export default function CandidatesPage() {
  // ── ORIGINAL backend logic — untouched ──────────────────────────────────
  const { jobId } = useParams();
  const [candidates, setCandidates] = useState([]);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [genLoading, setGenLoading] = useState(null);

  // Modal state
  const [modal, setModal] = useState(null); // { link, validationId }
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get(`/candidates/${jobId}`),
      api.get(`/jobs/${jobId}`),
    ]).then(([cr, jr]) => {
      setCandidates(cr.data);
      setJob(jr.data);
    }).catch(console.error).finally(() => setLoading(false));
  }, [jobId]);

  const generateTest = async (candidateId) => {
    setGenLoading(candidateId);
    try {
      const { data } = await api.post(`/validation/generate/${candidateId}`);
      sessionStorage.setItem(`val_${data.validationId}`, JSON.stringify(data.questions));
      const link = `${window.location.origin}/validation/${data.validationId}`;
      setModal({ link, validationId: data.validationId });
      setCopied(false);
      const cr = await api.get(`/candidates/${jobId}`);
      setCandidates(cr.data);
    } catch (e) {
      alert(e.response?.data?.error || 'Failed to generate test');
    } finally {
      setGenLoading(null);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(modal.link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  // ── end original logic ───────────────────────────────────────────────────

  return (
    <>
      <style>{globalStyles}</style>
      <BgOrbs />

      <div style={{ maxWidth: 1080, margin: '0 auto', padding: '28px 20px 60px', position: 'relative', zIndex: 1 }}>

        {/* ══════════════════════════════════════════════════════════════════
            MODAL — styled, same logic
        ══════════════════════════════════════════════════════════════════ */}
        {modal && (
          <div
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(15,23,42,0.55)',
              backdropFilter: 'blur(6px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 50, padding: 20,
              animation: 'fadeIn 0.2s ease both',
            }}
          >
            <div
              className="glass"
              style={{
                borderRadius: 24,
                width: '100%', maxWidth: 480,
                padding: '28px 28px 24px',
                boxShadow: '0 24px 80px rgba(0,0,0,0.25)',
                border: '1px solid rgba(255,255,255,0.6)',
                animation: 'modalSlideUp 0.4s cubic-bezier(.22,1,.36,1) both',
              }}
            >
              {/* Modal header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{
                    width: 48, height: 48,
                    background: 'linear-gradient(135deg,#22c55e,#15803d)',
                    borderRadius: 14,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 22,
                    boxShadow: '0 6px 18px rgba(34,197,94,0.35)',
                    animation: 'checkBounce 0.6s cubic-bezier(.22,1,.36,1) 0.1s both',
                  }}>
                    ✅
                  </div>
                  <div>
                    <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: 17, fontWeight: 800, color: '#1e293b', marginBottom: 2 }}>
                      Test Generated!
                    </h3>
                    <p style={{ fontSize: 12, color: '#94a3b8' }}>Share this link with the candidate</p>
                  </div>
                </div>
                <button
                  onClick={() => setModal(null)}
                  style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: '#f1f5f9', border: 'none', cursor: 'pointer',
                    fontSize: 14, color: '#64748b',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'background 0.2s',
                  }}
                >
                  ✕
                </button>
              </div>

              {/* Link box */}
              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 16,
                padding: '16px 18px',
                marginBottom: 18,
              }}>
                <p style={{ fontSize: 10.5, color: '#94a3b8', fontWeight: 700, letterSpacing: 1, marginBottom: 10 }}>
                  VALIDATION TEST LINK
                </p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    readOnly
                    value={modal.link}
                    className="input-glow"
                    onFocus={e => e.target.select()}
                    style={{
                      flex: 1,
                      background: '#fff',
                      border: '1.5px solid #e2e8f0',
                      borderRadius: 10,
                      padding: '9px 12px',
                      fontSize: 13,
                      color: '#374151',
                      fontFamily: 'Plus Jakarta Sans, sans-serif',
                    }}
                  />
                  <button
                    onClick={handleCopy}
                    style={{
                      padding: '9px 18px',
                      borderRadius: 10,
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: 13, fontWeight: 700,
                      fontFamily: 'Plus Jakarta Sans, sans-serif',
                      whiteSpace: 'nowrap',
                      transition: 'all 0.2s',
                      background: copied
                        ? 'linear-gradient(135deg,#22c55e,#15803d)'
                        : 'linear-gradient(135deg,#1d4ed8,#3b82f6)',
                      color: '#fff',
                      boxShadow: copied
                        ? '0 6px 18px rgba(34,197,94,0.3)'
                        : '0 6px 18px rgba(59,130,246,0.3)',
                    }}
                  >
                    {copied ? '✓ Copied!' : 'Copy'}
                  </button>
                </div>
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
                <a
                  href={modal.link}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    flex: 1, textAlign: 'center',
                    border: '1.5px solid #3b82f6',
                    color: '#1d4ed8',
                    padding: '11px',
                    borderRadius: 12,
                    fontSize: 13, fontWeight: 600,
                    textDecoration: 'none',
                    transition: 'background 0.2s',
                    background: '#fff',
                    fontFamily: 'Plus Jakarta Sans, sans-serif',
                  }}
                >
                  Open in New Tab ↗
                </a>
                <button
                  onClick={() => setModal(null)}
                  style={{
                    flex: 1,
                    background: '#f1f5f9',
                    color: '#64748b',
                    border: 'none',
                    padding: '11px',
                    borderRadius: 12,
                    fontSize: 13, fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: 'Plus Jakarta Sans, sans-serif',
                    transition: 'background 0.2s',
                  }}
                >
                  Close
                </button>
              </div>

              <p style={{ fontSize: 11.5, color: '#94a3b8', textAlign: 'center' }}>
                💡 Tip: Send this link to the candidate via email or WhatsApp
              </p>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            HERO HEADER
        ══════════════════════════════════════════════════════════════════ */}
        <div
          className="glass card-hover"
          style={{
            borderRadius: 20,
            border: '1px solid rgba(59,130,246,0.12)',
            marginBottom: 22,
            overflow: 'hidden',
            boxShadow: '0 8px 40px rgba(59,130,246,0.1)',
            animation: 'fadeUp 0.5s cubic-bezier(.22,1,.36,1) 0.05s both',
          }}
        >
          {/* Animated gradient banner */}
          <div style={{
            background: 'linear-gradient(135deg,#1e3a8a 0%,#1d4ed8 55%,#4f46e5 100%)',
            backgroundSize: '200% 200%',
            animation: 'gradientShift 7s ease infinite',
            padding: '24px 28px',
            position: 'relative', overflow: 'hidden',
          }}>
            <Particles />
            <div style={{ position:'absolute', top:-50, right:-50, width:200, height:200, borderRadius:'50%', border:'1px solid rgba(255,255,255,0.07)' }} />
            <div style={{ position:'absolute', top:-25, right:-25, width:130, height:130, borderRadius:'50%', border:'1px solid rgba(255,255,255,0.1)' }} />

            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', position:'relative' }}>
              <div style={{ display:'flex', alignItems:'center', gap:16 }}>
                {/* Job logo */}
                {job && (
                  <div style={{
                    width: 54, height: 54, borderRadius: 16,
                    background: 'rgba(255,255,255,0.18)',
                    backdropFilter: 'blur(10px)',
                    border: '2px solid rgba(255,255,255,0.28)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 800, color: '#fff',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
                    flexShrink: 0,
                    animation: 'float 5s ease-in-out infinite',
                  }}>
                    {job.title?.[0] ?? '?'}
                  </div>
                )}
                <div>
                  <p style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.6)', fontWeight: 700, letterSpacing: 1.2, marginBottom: 3 }}>
                    CANDIDATES
                  </p>
                  {/* Original: job.title + candidates.length */}
                  <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 21, fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>
                    {job ? job.title : 'Candidates'}
                  </h1>
                  {job && (
                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 4 }}>
                      {candidates.length} applicant{candidates.length !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              </div>

              {/* Original: Link to analytics */}
              <Link
                to={`/recruiter/analytics/${jobId}`}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255,255,255,0.25)',
                  color: '#fff', borderRadius: 12, padding: '9px 18px',
                  fontSize: 13, fontWeight: 600, textDecoration: 'none',
                  transition: 'background 0.2s',
                }}
              >
                📊 Analytics
              </Link>
            </div>
          </div>

          {/* Sub-bar */}
          <div style={{ padding: '10px 28px', background: '#fff', display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12.5, color: '#64748b' }}>
              👥 <strong style={{ color: '#1d4ed8' }}>{candidates.length}</strong> total ·
              <strong style={{ color: '#22c55e' }}> {candidates.filter(c => c.status === 'validated').length}</strong> validated ·
              <strong style={{ color: '#a855f7' }}> {candidates.filter(c => c.status === 'processed').length}</strong> awaiting test
            </span>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            LOADING STATE
        ══════════════════════════════════════════════════════════════════ */}
        {loading ? (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexDirection: 'column', gap: 12, minHeight: '30vh',
          }}>
            <div style={{ display: 'flex', gap: 6 }}>
              {[...Array(4)].map((_, i) => (
                <div key={i} style={{
                  width: 10, height: 10, borderRadius: '50%',
                  background: 'linear-gradient(135deg,#3b82f6,#1d4ed8)',
                  animation: `shimmerPulse 1s ease-in-out ${i * 0.15}s infinite`,
                }} />
              ))}
            </div>
            <p style={{ fontSize: 13, color: '#94a3b8', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              Loading candidates…
            </p>
          </div>

        /* ══════════════════════════════════════════════════════════════════
            EMPTY STATE
        ══════════════════════════════════════════════════════════════════ */
        ) : candidates.length === 0 ? (
          <div
            className="glass"
            style={{
              borderRadius: 20,
              border: '1px solid rgba(59,130,246,0.1)',
              padding: '60px 24px',
              textAlign: 'center',
              boxShadow: '0 6px 30px rgba(59,130,246,0.07)',
              animation: 'scaleIn 0.4s cubic-bezier(.22,1,.36,1) both',
            }}
          >
            <div style={{ fontSize: 52, marginBottom: 14, animation: 'float 4s ease-in-out infinite' }}>📭</div>
            <p style={{ fontFamily: 'Syne, sans-serif', fontSize: 18, fontWeight: 800, color: '#1e293b', marginBottom: 6 }}>
              No applications yet
            </p>
            <p style={{ fontSize: 13.5, color: '#64748b' }}>No one has applied for this role yet.</p>
          </div>

        /* ══════════════════════════════════════════════════════════════════
            CANDIDATES TABLE
        ══════════════════════════════════════════════════════════════════ */
        ) : (
          <div
            className="glass card-hover"
            style={{
              borderRadius: 20,
              border: '1px solid rgba(59,130,246,0.1)',
              overflow: 'hidden',
              boxShadow: '0 6px 30px rgba(59,130,246,0.07)',
              animation: 'fadeUp 0.6s cubic-bezier(.22,1,.36,1) 0.15s both',
            }}
          >
            {/* Column headers */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '56px 2fr 2fr 90px 90px 90px 110px 130px',
              padding: '12px 20px',
              background: '#f8fafc',
              borderBottom: '1px solid #f1f5f9',
            }}>
              {['Rank','Name','Email','Semantic','Validation','Final','Status','Actions'].map((h, idx) => (
                <span
                  key={h}
                  style={{
                    fontSize: 10.5, fontWeight: 700, color: '#94a3b8',
                    letterSpacing: 0.8, textTransform: 'uppercase',
                    textAlign: idx >= 3 && idx <= 5 ? 'center' : idx === 6 ? 'center' : idx === 7 ? 'right' : 'left',
                  }}
                >
                  {h}
                </span>
              ))}
            </div>

            {/* Rows — all original field references: c._id, c.name, c.email, c.semanticScore,
                c.validationScore, c.finalScore, c.status untouched */}
            {candidates.map((c, i) => {
              const st = statusStyle(c.status);
              return (
                <div
                  key={c._id}
                  className="cand-row"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '56px 2fr 2fr 90px 90px 90px 110px 130px',
                    padding: '13px 20px',
                    borderBottom: i < candidates.length - 1 ? '1px solid #f8fafc' : 'none',
                    alignItems: 'center',
                    animation: `rowReveal 0.45s ease ${0.2 + i * 0.04}s both`,
                  }}
                >
                  {/* Rank */}
                  <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                    <RankBadge i={i} />
                  </div>

                  {/* Name + avatar */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Avatar name={c.name} index={i} />
                    <span style={{ fontWeight: 700, fontSize: 13.5, color: '#1e293b' }}>{c.name}</span>
                  </div>

                  {/* Email */}
                  <span style={{ fontSize: 12.5, color: '#64748b' }}>{c.email}</span>

                  {/* Semantic */}
                  <div style={{ textAlign: 'center' }}>
                    <ScoreCell value={c.semanticScore} />
                  </div>

                  {/* Validation */}
                  <div style={{ textAlign: 'center' }}>
                    <ScoreCell value={c.validationScore} />
                  </div>

                  {/* Final */}
                  <div style={{ textAlign: 'center' }}>
                    <span style={{
                      display: 'inline-block',
                      fontFamily: 'Syne, sans-serif',
                      fontSize: 15, fontWeight: 800,
                      color: scoreColor(c.finalScore),
                      background: scoreBg(c.finalScore),
                      padding: '4px 12px', borderRadius: 12,
                      boxShadow: c.finalScore >= 70 ? '0 3px 10px rgba(34,197,94,0.2)' : 'none',
                    }}>
                      {c.finalScore ?? '—'}
                    </span>
                  </div>

                  {/* Status */}
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 5,
                      fontSize: 11.5, fontWeight: 700,
                      background: st.bg, color: st.color,
                      padding: '4px 12px', borderRadius: 20,
                      border: `1px solid ${st.color}22`,
                    }}>
                      <span style={{
                        width: 6, height: 6, borderRadius: '50%',
                        background: st.dot, flexShrink: 0,
                      }} />
                      {st.label}
                    </span>
                  </div>

                  {/* Actions — original View link + generateTest call */}
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', alignItems: 'center' }}>
                    <Link
                      to={`/recruiter/candidate/${c._id}`}
                      style={{
                        fontSize: 12, fontWeight: 700,
                        color: '#1d4ed8',
                        background: '#eff6ff',
                        border: '1px solid rgba(59,130,246,0.2)',
                        padding: '5px 12px', borderRadius: 8,
                        textDecoration: 'none',
                        transition: 'background 0.2s',
                      }}
                    >
                      View
                    </Link>

                    {/* Original: only shown when c.status === 'processed' */}
                    {c.status === 'processed' && (
                      <button
                        onClick={() => generateTest(c._id)}
                        disabled={genLoading === c._id}
                        className="gen-btn"
                        style={{
                          fontSize: 12, fontWeight: 700,
                          background: genLoading === c._id
                            ? '#f1f5f9'
                            : 'linear-gradient(135deg,#a855f7,#7c3aed)',
                          color: genLoading === c._id ? '#94a3b8' : '#fff',
                          border: 'none',
                          padding: '5px 12px', borderRadius: 8,
                          cursor: genLoading === c._id ? 'not-allowed' : 'pointer',
                          fontFamily: 'Plus Jakarta Sans, sans-serif',
                          display: 'flex', alignItems: 'center', gap: 4,
                          opacity: genLoading === c._id ? 0.6 : 1,
                        }}
                      >
                        {genLoading === c._id ? (
                          <>
                            <span style={{ animation: 'shimmerPulse 1s ease infinite' }}>⏳</span> …
                          </>
                        ) : (
                          <>🧪 Gen Test</>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';

// ─── Global Styles ────────────────────────────────────────────────────────────
const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
  * { box-sizing: border-box; }
  body, #root { font-family: 'Plus Jakarta Sans', sans-serif; background: #f0f4ff; margin: 0; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(22px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes scaleIn {
    from { opacity: 0; transform: scale(0.9); }
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
    50%      { transform: translateY(-9px); }
  }
  @keyframes particleFloat {
    0%   { transform: translateY(0) scale(1); opacity: 0.5; }
    100% { transform: translateY(-110px) scale(0); opacity: 0; }
  }
  @keyframes shimmerPulse {
    0%,100% { opacity: 1; }
    50%      { opacity: 0.45; }
  }
  @keyframes waveBar {
    0%,100% { transform: scaleY(0.4); }
    50%      { transform: scaleY(1); }
  }
  @keyframes checkBounce {
    0%   { transform: scale(0.3) rotate(-15deg); opacity: 0; }
    60%  { transform: scale(1.15) rotate(4deg); opacity: 1; }
    100% { transform: scale(1) rotate(0deg); opacity: 1; }
  }
  @keyframes scoreReveal {
    from { opacity: 0; transform: scale(0.6) rotate(-8deg); }
    to   { opacity: 1; transform: scale(1) rotate(0deg); }
  }
  @keyframes skillPop {
    from { opacity: 0; transform: scale(0.7) translateY(6px); }
    to   { opacity: 1; transform: scale(1) translateY(0); }
  }
  @keyframes dash {
    from { stroke-dashoffset: 283; }
  }
  @keyframes pulseRing {
    0%   { box-shadow: 0 0 0 0 rgba(59,130,246,0.3); }
    70%  { box-shadow: 0 0 0 12px rgba(59,130,246,0); }
    100% { box-shadow: 0 0 0 0 rgba(59,130,246,0); }
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
  .gradient-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .input-glow:focus {
    border-color: #3b82f6 !important;
    box-shadow: 0 0 0 4px rgba(59,130,246,0.12);
    outline: none;
  }
  .file-input::-webkit-file-upload-button {
    background: linear-gradient(135deg,#1d4ed8,#3b82f6);
    color: #fff;
    border: none;
    padding: 6px 16px;
    border-radius: 8px;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
    margin-right: 10px;
  }
  .skill-pill {
    animation: skillPop 0.35s cubic-bezier(.22,1,.36,1) both;
  }
  .wave-bar {
    width: 4px;
    border-radius: 2px;
    background: #fff;
    animation: waveBar 1s ease-in-out infinite;
  }
  .wave-bar:nth-child(2) { animation-delay: 0.1s; }
  .wave-bar:nth-child(3) { animation-delay: 0.2s; }
  .wave-bar:nth-child(4) { animation-delay: 0.3s; }
  .wave-bar:nth-child(5) { animation-delay: 0.4s; }
`;

// ─── Background Orbs ─────────────────────────────────────────────────────────
function BgOrbs() {
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
      <div style={{
        position: 'absolute', top: '-8%', right: '-4%',
        width: 500, height: 500, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(59,130,246,0.07) 0%, transparent 70%)',
        animation: 'orb1 11s ease-in-out infinite',
      }} />
      <div style={{
        position: 'absolute', bottom: '5%', left: '-6%',
        width: 400, height: 400, borderRadius: '50%',
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

// ─── Score Arc SVG ────────────────────────────────────────────────────────────
function ScoreArc({ score }) {
  const color = score >= 70 ? '#16a34a' : score >= 40 ? '#d97706' : '#dc2626';
  const bg    = score >= 70 ? '#f0fdf4'  : score >= 40 ? '#fffbeb'  : '#fef2f2';
  const label = score >= 70 ? '🎯 Strong Match' : score >= 40 ? '⚡ Partial Match' : '📌 Low Match';
  const circumference = 283;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div style={{ textAlign: 'center', padding: '12px 0' }}>
      <div style={{ position: 'relative', width: 150, height: 150, margin: '0 auto 14px' }}>
        <svg width="150" height="150" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="50" cy="50" r="45" fill="none" stroke="#f0f4ff" strokeWidth="6" />
          <circle
            cx="50" cy="50" r="45"
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 1.6s cubic-bezier(.22,1,.36,1)' }}
          />
        </svg>
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{
            fontFamily: 'Syne, sans-serif', fontSize: 30, fontWeight: 800, color,
            animation: 'scoreReveal 0.6s cubic-bezier(.22,1,.36,1) 0.4s both',
          }}>
            {score}
          </span>
          <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>/100</span>
        </div>
      </div>
      <span style={{
        display: 'inline-block',
        background: bg, color,
        fontWeight: 700, fontSize: 13,
        padding: '6px 18px', borderRadius: 20,
        boxShadow: `0 4px 14px ${color}22`,
        animation: 'scaleIn 0.5s cubic-bezier(.22,1,.36,1) 0.8s both',
      }}>
        {label}
      </span>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
export function ApplyPage() {
  // ── ORIGINAL backend logic — untouched ──────────────────────────────────
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [form, setForm] = useState({ name: '', email: '' });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    api.get(`/jobs/${jobId}`).then(r => setJob(r.data)).catch(() => setErr('Job not found'));
  }, [jobId]);

  const handleSubmit = async (e) => {
    e.preventDefault(); setErr(''); setLoading(true);
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('email', form.email);
      fd.append('jobId', jobId);
      fd.append('resume', file);
      const { data } = await api.post('/apply', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setResult(data);
    } catch (e) {
      setErr(e.response?.data?.error || 'Submission failed');
    } finally { setLoading(false); }
  };
  // ── end original logic ───────────────────────────────────────────────────

  // ══════════════════════════════════════════════════════════════════════════
  // RESULT VIEW — original: result.semanticScore, result.missingSkills, result.summary
  // ══════════════════════════════════════════════════════════════════════════
  if (result) return (
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
            width: '100%', maxWidth: 520,
            overflow: 'hidden',
            boxShadow: '0 24px 80px rgba(59,130,246,0.14)',
            border: '1px solid rgba(59,130,246,0.12)',
            animation: 'scaleIn 0.5s cubic-bezier(.22,1,.36,1) both',
          }}
        >
          {/* Success banner */}
          <div style={{
            background: 'linear-gradient(135deg,#1e3a8a,#1d4ed8,#4f46e5)',
            backgroundSize: '200% 200%',
            animation: 'gradientShift 7s ease infinite',
            padding: '30px 28px 26px',
            textAlign: 'center',
            position: 'relative', overflow: 'hidden',
          }}>
            <Particles />
            <div style={{ position: 'relative' }}>
              <div style={{
                width: 60, height: 60,
                background: 'rgba(255,255,255,0.18)',
                backdropFilter: 'blur(8px)',
                border: '2px solid rgba(255,255,255,0.3)',
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 26, margin: '0 auto 14px',
                animation: 'checkBounce 0.7s cubic-bezier(.22,1,.36,1) 0.1s both',
                boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
              }}>
                ✓
              </div>
              <h2 style={{
                fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 800,
                color: '#fff', marginBottom: 6,
              }}>
                Application Received!
              </h2>
              <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.75)' }}>
                Our AI has analyzed your resume. Here are your results:
              </p>
            </div>
          </div>

          {/* Results body */}
          <div style={{ padding: '28px 28px 24px' }}>

            {/* Score arc — result.semanticScore */}
            <ScoreArc score={result.semanticScore} />

            {/* Missing skills — result.missingSkills */}
            {result.missingSkills?.length > 0 && (
              <div
                className="card-hover"
                style={{
                  marginTop: 20,
                  background: 'linear-gradient(135deg,#fffbeb,#ffedd5)',
                  border: '1px solid rgba(249,115,22,0.18)',
                  borderRadius: 16, padding: '16px 18px',
                  animation: 'fadeUp 0.5s cubic-bezier(.22,1,.36,1) 0.5s both',
                }}
              >
                <p style={{ fontSize: 12.5, fontWeight: 700, color: '#c2410c', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{
                    background: 'linear-gradient(135deg,#f97316,#c2410c)',
                    color: '#fff', borderRadius: 6, padding: '2px 8px', fontSize: 11,
                  }}>⚠ Gaps</span>
                  Skills to Develop
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                  {result.missingSkills.map((s, i) => (
                    <span
                      key={s}
                      className="skill-pill"
                      style={{
                        animationDelay: `${0.6 + i * 0.07}s`,
                        background: '#fff',
                        color: '#c2410c', fontSize: 12, fontWeight: 700,
                        padding: '5px 13px', borderRadius: 20,
                        border: '1px solid rgba(249,115,22,0.25)',
                      }}
                    >
                      ⚡ {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Summary — result.summary */}
            {result.summary && (
              <div style={{
                marginTop: 16,
                background: 'linear-gradient(135deg,#1e3a8a,#1d4ed8,#4f46e5)',
                backgroundSize: '200% 200%',
                animation: 'gradientShift 7s ease infinite, fadeUp 0.5s cubic-bezier(.22,1,.36,1) 0.6s both',
                borderRadius: 16, padding: '16px 18px',
                position: 'relative', overflow: 'hidden',
              }}>
                <Particles />
                <div style={{ position: 'relative' }}>
                  <span style={{
                    fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.7)',
                    letterSpacing: 0.8, display: 'block', marginBottom: 7,
                  }}>
                    🤖 AI SUMMARY
                  </span>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.88)', lineHeight: 1.65, fontStyle: 'italic' }}>
                    "{result.summary}"
                  </p>
                </div>
              </div>
            )}

            {/* Great match banner — original: result.semanticScore >= 50 */}
            {result.semanticScore >= 50 && (
              <div style={{
                marginTop: 16,
                background: 'linear-gradient(135deg,#eff6ff,#dbeafe)',
                border: '1px solid rgba(59,130,246,0.2)',
                borderRadius: 16, padding: '14px 18px',
                fontSize: 13, color: '#1e40af',
                animation: 'fadeUp 0.5s cubic-bezier(.22,1,.36,1) 0.7s both',
              }}>
                🎯 Great match! The recruiter may invite you for a validation test.
              </div>
            )}

            {/* Original: Link to="/" */}
            <Link
              to="/"
              className="gradient-btn"
              style={{
                display: 'block', width: '100%', marginTop: 20,
                textAlign: 'center', textDecoration: 'none',
                color: '#fff', border: 'none',
                padding: '13px', borderRadius: 14,
                fontFamily: 'Plus Jakarta Sans, sans-serif',
                fontSize: 14, fontWeight: 700,
                animation: 'fadeUp 0.5s cubic-bezier(.22,1,.36,1) 0.8s both',
              }}
            >
              Back to Jobs →
            </Link>
          </div>
        </div>
      </div>
    </>
  );

  // ══════════════════════════════════════════════════════════════════════════
  // FORM VIEW
  // ══════════════════════════════════════════════════════════════════════════
  return (
    <>
      <style>{globalStyles}</style>
      <BgOrbs />

      <div style={{ minHeight: '100vh', padding: '28px 20px 60px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 580, margin: '0 auto' }}>

          {/* Back link */}
          <Link to="/" style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            fontSize: 13, color: '#3b82f6', fontWeight: 600,
            textDecoration: 'none',
            background: 'rgba(59,130,246,0.08)',
            padding: '6px 14px', borderRadius: 20,
            marginBottom: 22,
            transition: 'background 0.2s',
          }}>
            ← Back to Jobs
          </Link>

          {/* Job card — original: job.title, job.description, job.requiredSkills */}
          {job && (
            <div
              className="glass card-hover"
              style={{
                borderRadius: 20,
                border: '1px solid rgba(59,130,246,0.12)',
                marginBottom: 18,
                overflow: 'hidden',
                boxShadow: '0 8px 40px rgba(59,130,246,0.1)',
                animation: 'fadeUp 0.5s cubic-bezier(.22,1,.36,1) 0.05s both',
              }}
            >
              {/* Gradient banner */}
              <div style={{
                background: 'linear-gradient(135deg,#1e3a8a,#1d4ed8,#4f46e5)',
                backgroundSize: '200% 200%',
                animation: 'gradientShift 7s ease infinite',
                padding: '22px 24px',
                position: 'relative', overflow: 'hidden',
              }}>
                <Particles />
                <div style={{ position: 'absolute', top:-50, right:-50, width:180, height:180, borderRadius:'50%', border:'1px solid rgba(255,255,255,0.07)' }} />
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 14 }}>
                  {/* Logo from job.title[0] */}
                  <div style={{
                    width: 52, height: 52, borderRadius: 15,
                    background: 'rgba(255,255,255,0.18)',
                    backdropFilter: 'blur(10px)',
                    border: '2px solid rgba(255,255,255,0.28)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 800, color: '#fff',
                    boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
                    flexShrink: 0,
                    animation: 'float 5s ease-in-out infinite',
                  }}>
                    {job.title?.[0] ?? '?'}
                  </div>
                  <div>
                    <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 19, fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>
                      {job.title}
                    </h1>
                    <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.7)', marginTop: 3, lineHeight: 1.4 }}>
                      {job.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Required skills — job.requiredSkills */}
              {job.requiredSkills?.length > 0 && (
                <div style={{ padding: '12px 20px', background: '#fff', display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                  {job.requiredSkills.map((s, i) => (
                    <span
                      key={s}
                      className="skill-pill"
                      style={{
                        animationDelay: `${i * 0.06}s`,
                        background: 'linear-gradient(135deg,#eff6ff,#dbeafe)',
                        color: '#1d4ed8', fontSize: 11.5, fontWeight: 700,
                        padding: '4px 12px', borderRadius: 20,
                        border: '1px solid rgba(59,130,246,0.18)',
                      }}
                    >
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Form card */}
          <div
            className="glass card-hover"
            style={{
              borderRadius: 20,
              border: '1px solid rgba(59,130,246,0.1)',
              padding: '28px 28px 24px',
              boxShadow: '0 8px 40px rgba(59,130,246,0.08)',
              animation: 'fadeUp 0.5s cubic-bezier(.22,1,.36,1) 0.15s both',
            }}
          >
            <h2 style={{
              fontFamily: 'Syne, sans-serif', fontSize: 19, fontWeight: 800,
              color: '#1e293b', marginBottom: 6,
            }}>
              Submit Application
            </h2>
            <p style={{ fontSize: 13, color: '#64748b', marginBottom: 24 }}>
              Fill in your details and upload your resume for instant AI analysis.
            </p>

            {/* Error — original err state */}
            {err && (
              <div style={{
                background: '#fef2f2', border: '1px solid #fecaca',
                color: '#dc2626', borderRadius: 12, padding: '11px 14px',
                fontSize: 13, marginBottom: 18,
                animation: 'scaleIn 0.3s ease both',
                display: 'flex', alignItems: 'center', gap: 7,
              }}>
                ⚠️ {err}
              </div>
            )}

            {/* Original form with handleSubmit */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

              {/* Name — form.name */}
              <div style={{ animation: 'fadeUp 0.5s cubic-bezier(.22,1,.36,1) 0.2s both' }}>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#374151', marginBottom: 7 }}>
                  👤 Full Name
                </label>
                <input
                  className="input-glow"
                  placeholder="Jane Doe"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  required
                  style={{
                    width: '100%', border: '1.5px solid #e2e8f0',
                    borderRadius: 12, padding: '11px 14px',
                    fontSize: 14, background: '#fff',
                    fontFamily: 'Plus Jakarta Sans, sans-serif',
                    color: '#1e293b',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                  }}
                />
              </div>

              {/* Email — form.email */}
              <div style={{ animation: 'fadeUp 0.5s cubic-bezier(.22,1,.36,1) 0.28s both' }}>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#374151', marginBottom: 7 }}>
                  ✉️ Email
                </label>
                <input
                  className="input-glow"
                  type="email"
                  placeholder="jane@example.com"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  required
                  style={{
                    width: '100%', border: '1.5px solid #e2e8f0',
                    borderRadius: 12, padding: '11px 14px',
                    fontSize: 14, background: '#fff',
                    fontFamily: 'Plus Jakarta Sans, sans-serif',
                    color: '#1e293b',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                  }}
                />
              </div>

              {/* File — original: accept=".pdf,.doc,.docx", onChange sets file */}
              <div style={{ animation: 'fadeUp 0.5s cubic-bezier(.22,1,.36,1) 0.36s both' }}>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#374151', marginBottom: 7 }}>
                  📄 Resume (PDF or DOCX, max 5MB)
                </label>
                <div style={{
                  border: `2px dashed ${file ? '#22c55e' : '#bfdbfe'}`,
                  borderRadius: 14,
                  padding: '22px 18px',
                  textAlign: 'center',
                  background: file ? 'rgba(34,197,94,0.03)' : 'rgba(59,130,246,0.02)',
                  transition: 'all 0.3s',
                  cursor: 'pointer',
                  position: 'relative',
                }}
                  onClick={() => document.getElementById('fileInputApply').click()}
                >
                  <input
                    id="fileInputApply"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={e => setFile(e.target.files[0])}
                    required
                    style={{ display: 'none' }}
                  />
                  {file ? (
                    <div style={{ animation: 'scaleIn 0.4s cubic-bezier(.22,1,.36,1) both' }}>
                      <div style={{ fontSize: 32, marginBottom: 6, animation: 'float 4s ease-in-out infinite' }}>📄</div>
                      <p style={{ fontWeight: 700, color: '#16a34a', fontSize: 13.5 }}>{file.name}</p>
                      <p style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 3 }}>
                        {(file.size / 1024).toFixed(1)} KB · click to change
                      </p>
                    </div>
                  ) : (
                    <div>
                      <div style={{ fontSize: 32, marginBottom: 8, animation: 'float 5s ease-in-out infinite' }}>📁</div>
                      <p style={{ fontWeight: 700, color: '#374151', fontSize: 13.5 }}>Click to browse</p>
                      <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 3 }}>PDF · DOCX · max 5MB</p>
                    </div>
                  )}
                </div>
              </div>

              {/* AI features info */}
              <div style={{
                background: 'linear-gradient(135deg,#eff6ff,#f0f4ff)',
                border: '1px solid rgba(59,130,246,0.15)',
                borderRadius: 14, padding: '14px 16px',
                animation: 'fadeUp 0.5s cubic-bezier(.22,1,.36,1) 0.42s both',
              }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: '#1d4ed8', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{
                    background: 'linear-gradient(135deg,#1d4ed8,#6366f1)',
                    color: '#fff', borderRadius: 6, padding: '2px 8px', fontSize: 11,
                  }}>🤖 AI</span>
                  What we analyze instantly
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px 16px' }}>
                  {[
                    '✦ Skills extraction & matching',
                    '✦ Semantic similarity score',
                    '✦ Missing skills detection',
                    '✦ Professional summary',
                  ].map((t, i) => (
                    <span key={i} style={{
                      fontSize: 11.5, color: '#1e40af',
                      animation: `fadeUp 0.4s ease ${0.5 + i * 0.06}s both`,
                    }}>
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Submit button — original: disabled={loading || !file} */}
              <button
                type="submit"
                disabled={loading || !file}
                className="gradient-btn"
                style={{
                  width: '100%', color: '#fff', border: 'none',
                  padding: '14px', borderRadius: 14,
                  fontFamily: 'Plus Jakarta Sans, sans-serif',
                  fontSize: 15, fontWeight: 700, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  animation: 'fadeUp 0.5s cubic-bezier(.22,1,.36,1) 0.5s both',
                }}
              >
                {loading ? (
                  <>
                    <div style={{ display: 'flex', gap: 3, height: 20, alignItems: 'center' }}>
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="wave-bar" style={{ height: `${12 + i * 2}px` }} />
                      ))}
                    </div>
                    AI is analyzing your resume...
                  </>
                ) : (
                  'Submit Application →'
                )}
              </button>
            </form>
          </div>

        </div>
      </div>
    </>
  );
}

export default ApplyPage;
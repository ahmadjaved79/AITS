import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import api from '../../api';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// ─── Global Styles ────────────────────────────────────────────────────────────
const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
  * { box-sizing: border-box; }
  body, #root { font-family: 'Plus Jakarta Sans', sans-serif; background: #f0f4ff; margin: 0; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
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
  @keyframes barReveal {
    from { opacity: 0; transform: translateX(-12px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes shimmerPulse {
    0%,100% { opacity: 1; }
    50%      { opacity: 0.5; }
  }
  @keyframes barGrow {
    from { width: 0%; }
  }
  @keyframes scaleIn {
    from { opacity: 0; transform: scale(0.7); }
    to   { opacity: 1; transform: scale(1); }
  }

  .gradient-text {
    background: linear-gradient(135deg, #1d4ed8, #3b82f6, #6366f1);
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: gradientShift 4s ease infinite;
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
    transform: translateY(-4px);
    box-shadow: 0 20px 50px rgba(59,130,246,0.13) !important;
  }
  .cand-row {
    transition: background 0.2s, transform 0.15s;
  }
  .cand-row:hover {
    background: rgba(59,130,246,0.04) !important;
    transform: translateX(3px);
  }
  .skill-bar-fill {
    animation: barGrow 1.4s cubic-bezier(.22,1,.36,1) both;
  }
  .metric-val {
    animation: scaleIn 0.5s cubic-bezier(.22,1,.36,1) both;
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

// ─── Animated Counter ─────────────────────────────────────────────────────────
function AnimatedCounter({ value }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const target = Number(value) || 0;
    if (target === 0) { setDisplay(0); return; }
    let start = 0;
    const step = Math.ceil(target / 40);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setDisplay(target); clearInterval(timer); }
      else setDisplay(start);
    }, 20);
    return () => clearInterval(timer);
  }, [value]);
  return <>{display}</>;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
const skillColors = ['#3b82f6','#6366f1','#22c55e','#f97316','#a855f7','#ec4899','#14b8a6','#f59e0b'];
const avatarGradients = [
  'linear-gradient(135deg,#3b82f6,#1d4ed8)',
  'linear-gradient(135deg,#6366f1,#4f46e5)',
  'linear-gradient(135deg,#22c55e,#15803d)',
  'linear-gradient(135deg,#f97316,#c2410c)',
  'linear-gradient(135deg,#a855f7,#7c3aed)',
];

function scoreColor(s) {
  return s >= 80 ? '#16a34a' : s >= 60 ? '#2563eb' : s >= 40 ? '#d97706' : '#dc2626';
}
function scoreBg(s) {
  return s >= 80 ? '#f0fdf4' : s >= 60 ? '#eff6ff' : s >= 40 ? '#fffbeb' : '#fef2f2';
}
function getStatusStyle(idx) {
  if (idx === 0) return { bg: '#f0fdf4', color: '#16a34a', label: '⭐ Top Pick' };
  if (idx === 1) return { bg: '#eff6ff', color: '#1d4ed8', label: '✦ Shortlisted' };
  if (idx === 2) return { bg: '#fefce8', color: '#854d0e', label: '👁 Reviewing' };
  return { bg: '#f8fafc', color: '#64748b', label: '⏳ Pending' };
}

// ═════════════════════════════════════════════════════════════════════════════
export function AnalyticsPage() {
  // ── ORIGINAL backend logic — untouched ──────────────────────────────────
  const { jobId } = useParams();
  const [data, setData] = useState(null);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get(`/analytics/${jobId}`), api.get(`/jobs/${jobId}`)])
      .then(([ar, jr]) => { setData(ar.data); setJob(jr.data); })
      .catch(console.error).finally(() => setLoading(false));
  }, [jobId]);
  // ── end original logic ───────────────────────────────────────────────────

  // ─── Loading ─────────────────────────────────────────────────────────────
  if (loading) return (
    <>
      <style>{globalStyles}</style>
      <BgOrbs />
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '60vh', flexDirection: 'column', gap: 12,
        position: 'relative', zIndex: 1,
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
          Loading analytics…
        </p>
      </div>
    </>
  );

  if (!data) return (
    <>
      <style>{globalStyles}</style>
      <div style={{
        textAlign: 'center', padding: '60px 20px',
        fontFamily: 'Plus Jakarta Sans, sans-serif', color: '#ef4444', fontSize: 14,
      }}>
        No analytics data found.
      </div>
    </>
  );

  // ─── Original chart configs (exact same data mapping) ────────────────────
  const topChart = {
    labels: data.topCandidates.map(c => c.name.split(' ')[0]),
    datasets: [
      {
        label: 'Semantic',
        data: data.topCandidates.map(c => c.semanticScore),
        backgroundColor: 'rgba(96,165,250,0.85)',
        borderRadius: 8,
        borderSkipped: false,
      },
      {
        label: 'Final Score',
        data: data.topCandidates.map(c => c.finalScore),
        backgroundColor: 'rgba(29,78,216,0.9)',
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };

  const skillChart = {
    labels: data.skillDistribution.map(s => s.skill),
    datasets: [{
      label: 'Candidates with skill',
      data: data.skillDistribution.map(s => s.count),
      backgroundColor: data.skillDistribution.map((_, i) => skillColors[i % skillColors.length]),
      borderRadius: 8,
      borderSkipped: false,
    }],
  };

  const chartOpts = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: { family: 'Plus Jakarta Sans', size: 12 },
          boxWidth: 10,
          usePointStyle: true,
        },
      },
      tooltip: {
        backgroundColor: '#1e293b',
        titleFont: { family: 'Plus Jakarta Sans', size: 12, weight: '700' },
        bodyFont: { family: 'Plus Jakarta Sans', size: 12 },
        cornerRadius: 10,
        padding: 12,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { family: 'Plus Jakarta Sans', size: 11 } },
      },
      y: {
        grid: { color: 'rgba(0,0,0,0.04)' },
        ticks: { font: { family: 'Plus Jakarta Sans', size: 11 } },
        beginAtZero: true,
      },
    },
  };

  const maxSkill = Math.max(...data.skillDistribution.map(s => s.count), 1);

  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <>
      <style>{globalStyles}</style>
      <BgOrbs />

      <div style={{ maxWidth: 1080, margin: '0 auto', padding: '28px 20px 60px', position: 'relative', zIndex: 1 }}>

        {/* ── Hero Header ────────────────────────────────────────────────── */}
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
            padding: '26px 28px',
            position: 'relative', overflow: 'hidden',
          }}>
            <Particles />
            <div style={{ position:'absolute', top:-50, right:-50, width:200, height:200, borderRadius:'50%', border:'1px solid rgba(255,255,255,0.07)' }} />
            <div style={{ position:'absolute', top:-25, right:-25, width:130, height:130, borderRadius:'50%', border:'1px solid rgba(255,255,255,0.1)' }} />

            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', position:'relative' }}>
              <div style={{ display:'flex', alignItems:'center', gap:16 }}>
                {/* Company logo from job.title */}
                {job && (
                  <div style={{
                    width: 58, height: 58, borderRadius: 18,
                    background: 'rgba(255,255,255,0.18)',
                    backdropFilter: 'blur(10px)',
                    border: '2px solid rgba(255,255,255,0.28)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'Syne, sans-serif', fontSize: 24, fontWeight: 800, color: '#fff',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                    flexShrink: 0,
                    animation: 'float 5s ease-in-out infinite',
                  }}>
                    {job.title?.[0] ?? '?'}
                  </div>
                )}
                <div>
                  <p style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.6)', fontWeight: 700, letterSpacing: 1.2, marginBottom: 3 }}>
                    ANALYTICS DASHBOARD
                  </p>
                  <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>
                    {job ? job.title : 'Job Analytics'}
                  </h1>
                  <div style={{ display:'flex', gap:10, marginTop:6 }}>
                    <span style={{
                      fontSize: 11.5, color: '#86efac', fontWeight: 700,
                      background: 'rgba(34,197,94,0.15)', padding: '3px 12px', borderRadius: 12,
                    }}>
                      🟢 Live Data
                    </span>
                  </div>
                </div>
              </div>

              {/* Original back link */}
              <Link to={`/recruiter/candidates/${jobId}`} style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.25)',
                color: '#fff', borderRadius: 12, padding: '9px 18px',
                fontSize: 13, fontWeight: 600, textDecoration: 'none',
                transition: 'background 0.2s',
              }}>
                ← Candidates
              </Link>
            </div>
          </div>

          {/* Quick-stat sub-bar using live data.metrics */}
          <div style={{ padding: '12px 28px', background: '#fff', display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12.5, color: '#64748b' }}>
              📊 <strong style={{ color: '#1d4ed8' }}>{data.metrics.total}</strong> total applicants ·
              avg semantic <strong style={{ color: '#6366f1' }}> {data.metrics.avgSemantic}</strong> ·
              avg final <strong style={{ color: '#16a34a' }}> {data.metrics.avgFinal}</strong>
            </span>
          </div>
        </div>

        {/* ── Metric Cards (data.metrics) ──────────────────────────────────── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16, marginBottom: 22,
        }}>
          {[
            { icon: '👥', label: 'Total Applicants',   value: data.metrics.total,       gradient: 'linear-gradient(135deg,#3b82f6,#1d4ed8)', shadow: 'rgba(59,130,246,0.25)',  delay: 0.10 },
            { icon: '🤖', label: 'Avg Semantic Score', value: data.metrics.avgSemantic,  gradient: 'linear-gradient(135deg,#6366f1,#4f46e5)', shadow: 'rgba(99,102,241,0.25)',  delay: 0.18 },
            { icon: '🏆', label: 'Avg Final Score',    value: data.metrics.avgFinal,     gradient: 'linear-gradient(135deg,#22c55e,#15803d)', shadow: 'rgba(34,197,94,0.25)',   delay: 0.26 },
            { icon: '⚡', label: 'Top Candidates',     value: data.topCandidates.length, gradient: 'linear-gradient(135deg,#f97316,#c2410c)', shadow: 'rgba(249,115,22,0.25)', delay: 0.34 },
          ].map((m) => (
            <div
              key={m.label}
              className="glass card-hover"
              style={{
                borderRadius: 20,
                border: '1px solid rgba(59,130,246,0.1)',
                padding: '22px 20px',
                boxShadow: '0 6px 30px rgba(59,130,246,0.07)',
                animation: `fadeUp 0.6s cubic-bezier(.22,1,.36,1) ${m.delay}s both`,
                position: 'relative', overflow: 'hidden',
              }}
            >
              <div style={{
                position: 'absolute', top: -30, right: -30,
                width: 110, height: 110, borderRadius: '50%',
                background: m.gradient, opacity: 0.1,
              }} />
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontSize: 12, color: '#64748b', fontWeight: 600, letterSpacing: 0.3, marginBottom: 8 }}>
                    {m.label}
                  </p>
                  <div
                    className="metric-val"
                    style={{
                      fontFamily: 'Syne, sans-serif', fontSize: 36, fontWeight: 800,
                      background: m.gradient, backgroundSize: '200% auto',
                      WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text', lineHeight: 1,
                      animationDelay: `${m.delay + 0.1}s`,
                    }}
                  >
                    <AnimatedCounter value={m.value} />
                  </div>
                </div>
                <div style={{
                  width: 44, height: 44, borderRadius: 14,
                  background: m.gradient,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 20, flexShrink: 0,
                  boxShadow: `0 6px 18px ${m.shadow}`,
                }}>
                  {m.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Charts Row ────────────────────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 18, marginBottom: 18 }}>

          {/* Top Candidates Bar — original topChart data */}
          <div
            className="glass card-hover"
            style={{
              borderRadius: 20,
              border: '1px solid rgba(59,130,246,0.1)',
              padding: '24px',
              boxShadow: '0 6px 30px rgba(59,130,246,0.07)',
              animation: 'fadeUp 0.6s cubic-bezier(.22,1,.36,1) 0.2s both',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
              <div>
                <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: 16, fontWeight: 800, color: '#1e293b', marginBottom: 3 }}>
                  🏅 Top Candidates
                </h3>
                <p style={{ fontSize: 12, color: '#64748b' }}>Semantic vs Final score</p>
              </div>
              <span style={{
                fontSize: 11, fontWeight: 700, color: '#16a34a',
                background: '#f0fdf4', border: '1px solid #bbf7d0',
                padding: '4px 12px', borderRadius: 20,
              }}>
                Top {data.topCandidates.length}
              </span>
            </div>
            {data.topCandidates.length > 0
              ? <Bar data={topChart} options={chartOpts} />
              : <p style={{ color: '#94a3b8', fontSize: 13, textAlign: 'center', padding: '32px 0' }}>No data yet</p>
            }
          </div>

          {/* Skill Distribution — original skillChart data, rendered as animated custom bars */}
          <div
            className="glass card-hover"
            style={{
              borderRadius: 20,
              border: '1px solid rgba(59,130,246,0.1)',
              padding: '24px',
              boxShadow: '0 6px 30px rgba(59,130,246,0.07)',
              animation: 'fadeUp 0.6s cubic-bezier(.22,1,.36,1) 0.28s both',
            }}
          >
            <div style={{ marginBottom: 18 }}>
              <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: 16, fontWeight: 800, color: '#1e293b', marginBottom: 3 }}>
                🔧 Skill Distribution
              </h3>
              <p style={{ fontSize: 12, color: '#64748b' }}>Candidates per required skill</p>
            </div>

            {data.skillDistribution.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {data.skillDistribution.map((s, i) => (
                  <div key={s.skill} style={{ animation: `barReveal 0.5s ease ${0.3 + i * 0.07}s both` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                      <span style={{ fontSize: 12.5, fontWeight: 600, color: '#374151' }}>{s.skill}</span>
                      <span style={{ fontSize: 12.5, fontWeight: 700, color: skillColors[i % skillColors.length] }}>
                        {s.count}
                      </span>
                    </div>
                    <div style={{ height: 9, background: '#f1f5f9', borderRadius: 8, overflow: 'hidden' }}>
                      <div
                        className="skill-bar-fill"
                        style={{
                          height: '100%',
                          width: `${(s.count / maxSkill) * 100}%`,
                          background: `linear-gradient(90deg, ${skillColors[i % skillColors.length]}, ${skillColors[i % skillColors.length]}bb)`,
                          borderRadius: 8,
                          boxShadow: `0 2px 8px ${skillColors[i % skillColors.length]}44`,
                          animationDelay: `${0.4 + i * 0.1}s`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: '#94a3b8', fontSize: 13, textAlign: 'center', padding: '32px 0' }}>No data yet</p>
            )}
          </div>
        </div>

        {/* ── Leaderboard table (data.topCandidates) ───────────────────────── */}
        {data.topCandidates.length > 0 && (
          <div
            className="glass card-hover"
            style={{
              borderRadius: 20,
              border: '1px solid rgba(59,130,246,0.1)',
              overflow: 'hidden',
              boxShadow: '0 6px 30px rgba(59,130,246,0.07)',
              marginBottom: 18,
              animation: 'fadeUp 0.6s cubic-bezier(.22,1,.36,1) 0.38s both',
            }}
          >
            {/* Header */}
            <div style={{
              padding: '20px 24px 16px',
              borderBottom: '1px solid #f1f5f9',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div>
                <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: 16, fontWeight: 800, color: '#1e293b', marginBottom: 2 }}>
                  🎯 Candidate Leaderboard
                </h3>
                <p style={{ fontSize: 12, color: '#64748b' }}>Ranked by semantic & final score</p>
              </div>
              <span style={{
                fontSize: 11, fontWeight: 700,
                background: 'linear-gradient(135deg,#eff6ff,#dbeafe)',
                color: '#1d4ed8', padding: '4px 14px', borderRadius: 20,
                border: '1px solid rgba(59,130,246,0.2)',
              }}>
                {data.topCandidates.length} Candidates
              </span>
            </div>

            {/* Column labels */}
            <div style={{
              display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr',
              padding: '10px 24px', background: '#f8fafc',
              borderBottom: '1px solid #f1f5f9',
            }}>
              {['Candidate','Semantic Score','Final Score','Status'].map(h => (
                <span key={h} style={{ fontSize: 10.5, fontWeight: 700, color: '#94a3b8', letterSpacing: 0.8, textTransform: 'uppercase' }}>
                  {h}
                </span>
              ))}
            </div>

            {/* Rows — c.name, c.semanticScore, c.finalScore straight from API */}
            {data.topCandidates.map((c, i) => {
              const status = getStatusStyle(i);
              return (
                <div
                  key={c.name}
                  className="cand-row"
                  style={{
                    display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr',
                    padding: '14px 24px',
                    borderBottom: i < data.topCandidates.length - 1 ? '1px solid #f1f5f9' : 'none',
                    alignItems: 'center',
                    animation: `barReveal 0.5s ease ${0.45 + i * 0.06}s both`,
                  }}
                >
                  {/* Avatar + name */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%',
                      background: avatarGradients[i % avatarGradients.length],
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontSize: 12, fontWeight: 700, flexShrink: 0,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                    }}>
                      {c.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13.5, color: '#1e293b' }}>{c.name}</div>
                      <div style={{ fontSize: 11, color: '#94a3b8' }}>#{i + 1} ranked</div>
                    </div>
                  </div>

                  {/* Semantic score with mini bar */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{
                      fontFamily: 'Syne, sans-serif', fontSize: 18, fontWeight: 800,
                      color: scoreColor(c.semanticScore),
                    }}>
                      {c.semanticScore}
                    </span>
                    <div style={{ flex: 1, maxWidth: 48 }}>
                      <div style={{ height: 5, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{
                          height: '100%', width: `${c.semanticScore}%`,
                          background: scoreColor(c.semanticScore), borderRadius: 4,
                          transition: 'width 1s ease',
                        }} />
                      </div>
                    </div>
                  </div>

                  {/* Final score badge */}
                  <div>
                    <span style={{
                      fontSize: 12.5, fontWeight: 700,
                      color: scoreColor(c.finalScore),
                      background: scoreBg(c.finalScore),
                      padding: '4px 12px', borderRadius: 16,
                      display: 'inline-block',
                    }}>
                      {c.finalScore}
                    </span>
                  </div>

                  {/* Status pill */}
                  <div>
                    <span style={{
                      fontSize: 11.5, fontWeight: 700,
                      background: status.bg, color: status.color,
                      padding: '4px 12px', borderRadius: 20,
                      display: 'inline-block',
                    }}>
                      {status.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── AI Insight Banner — uses live metrics ────────────────────────── */}
        <div style={{
          borderRadius: 20,
          background: 'linear-gradient(135deg,#1e3a8a,#1d4ed8,#4f46e5)',
          backgroundSize: '200% 200%',
          animation: 'gradientShift 7s ease infinite, fadeUp 0.6s cubic-bezier(.22,1,.36,1) 0.55s both',
          padding: '22px 26px',
          position: 'relative', overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(29,78,216,0.28)',
        }}>
          <Particles />
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ fontSize: 32, animation: 'float 5s ease-in-out infinite', flexShrink: 0 }}>🤖</div>
            <div>
              <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, color: '#fff', fontSize: 14, marginBottom: 5 }}>
                AI Snapshot
              </p>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', lineHeight: 1.65 }}>
                You have <strong>{data.metrics.total}</strong> applicants with an average semantic match of{' '}
                <strong>{data.metrics.avgSemantic}</strong> and average final score of{' '}
                <strong>{data.metrics.avgFinal}</strong>.
                {data.skillDistribution.length > 0 && (
                  <> The most represented skill is <strong>{data.skillDistribution[0]?.skill}</strong> with{' '}
                  <strong>{data.skillDistribution[0]?.count}</strong> candidates.</>
                )}
              </p>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}

export default AnalyticsPage;
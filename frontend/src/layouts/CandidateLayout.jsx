import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';

export default function CandidateLayout() {
  const loc = useLocation();
  const [scrolled, setScrolled]         = useState(false);
  const [menuOpen, setMenuOpen]         = useState(false);
  const [statsVisible, setStatsVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setStatsVisible(true), 400);
    return () => clearTimeout(t);
  }, []);

  const isHome = loc.pathname === '/';

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#f0f4ff' }}>

      {/* ══════════════════════════════════════
          NAVBAR
      ══════════════════════════════════════ */}
      <header className={`sticky top-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'shadow-2xl'
          : 'shadow-md'
      }`}
        style={{
          background: scrolled
            ? 'rgba(15,23,42,0.97)'
            : 'linear-gradient(90deg,#0f172a 0%,#1e3a8a 50%,#1d4ed8 100%)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(99,132,255,0.2)',
        }}
      >
        {/* Top accent line */}
        <div style={{
          height: 3,
          background: 'linear-gradient(90deg,#3b82f6,#818cf8,#a855f7,#3b82f6)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 3s linear infinite',
        }} />

        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">

          {/* Brand */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-sm"
                style={{ background: 'linear-gradient(135deg,#3b82f6,#6366f1)', boxShadow: '0 0 16px rgba(99,102,241,0.5)' }}>
                AI
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-gray-900 animate-pulse" />
            </div>
            <div>
              <span className="font-black text-white text-lg tracking-tight block leading-none">AHIS</span>
              <span className="text-xs font-medium block leading-none mt-0.5"
                style={{ background: 'linear-gradient(90deg,#93c5fd,#c4b5fd)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Autonomous Hiring Intelligence
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {[
              { label: '🏠 Jobs',         href: '/',              type: 'link' },
              { label: '⚙️ How It Works', href: '#how-it-works',  type: 'anchor' },
              { label: '🧪 Tech Stack',   href: '#tech-stack',    type: 'anchor' },
              { label: '❓ FAQ',          href: '#faq',           type: 'anchor' },
            ].map(item => (
              item.type === 'link'
                ? <Link key={item.label} to={item.href}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isHome
                        ? 'text-white bg-white/15 border border-white/20'
                        : 'text-blue-200 hover:text-white hover:bg-white/10'
                    }`}>
                    {item.label}
                  </Link>
                : <a key={item.label} href={item.href}
                    className="px-4 py-2 rounded-lg text-sm font-medium text-blue-200 hover:text-white hover:bg-white/10 transition-all duration-200">
                    {item.label}
                  </a>
            ))}

            {/* Divider */}
            <div className="w-px h-6 bg-white/20 mx-2" />

            <Link to="/login"
              className="relative px-5 py-2.5 rounded-xl text-sm font-bold text-white overflow-hidden group transition-all"
              style={{ background: 'linear-gradient(135deg,#3b82f6,#6366f1)', boxShadow: '0 4px 15px rgba(99,102,241,0.4)' }}>
              <span className="relative z-10">Recruiter Login →</span>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: 'linear-gradient(135deg,#2563eb,#4f46e5)' }} />
            </Link>
          </nav>

          {/* Mobile toggle */}
          <button className="md:hidden p-2 rounded-lg hover:bg-white/10 transition" onClick={() => setMenuOpen(!menuOpen)}>
            <div className="w-5 space-y-1">
              <span className={`block h-0.5 bg-white rounded transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
              <span className={`block h-0.5 bg-white rounded transition-all duration-300 ${menuOpen ? 'opacity-0 w-0' : 'w-full'}`} />
              <span className={`block h-0.5 bg-white rounded transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
            </div>
          </button>
        </div>

        {/* Mobile Menu */}
        <div className={`md:hidden transition-all duration-300 overflow-hidden ${menuOpen ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'}`}
          style={{ borderTop: '1px solid rgba(255,255,255,0.1)', background: 'rgba(15,23,42,0.98)' }}>
          <div className="px-4 py-4 space-y-1">
            {[
              { label: '🏠 Jobs',         to: '/',             isLink: true },
              { label: '⚙️ How It Works', to: '#how-it-works', isLink: false },
              { label: '🧪 Tech Stack',   to: '#tech-stack',   isLink: false },
              { label: '❓ FAQ',          to: '#faq',          isLink: false },
            ].map(item => (
              item.isLink
                ? <Link key={item.label} to={item.to} onClick={() => setMenuOpen(false)}
                    className="block px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-white/10 transition">
                    {item.label}
                  </Link>
                : <a key={item.label} href={item.to} onClick={() => setMenuOpen(false)}
                    className="block px-4 py-2.5 rounded-xl text-sm font-medium text-blue-200 hover:bg-white/10 hover:text-white transition">
                    {item.label}
                  </a>
            ))}
            <Link to="/login" onClick={() => setMenuOpen(false)}
              className="block px-4 py-3 rounded-xl text-sm font-bold text-white text-center mt-2"
              style={{ background: 'linear-gradient(135deg,#3b82f6,#6366f1)' }}>
              Recruiter Login →
            </Link>
          </div>
        </div>
      </header>

      {/* ══════════════════════════════════════
          HERO (home only)
      ══════════════════════════════════════ */}
      {isHome && (
        <section className="relative overflow-hidden py-20 px-4"
          style={{ background: 'linear-gradient(135deg,#0f172a 0%,#1e3a8a 40%,#1d4ed8 70%,#4f46e5 100%)' }}>

          {/* Animated blobs */}
          <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl"
            style={{ background: 'radial-gradient(circle,#818cf8,transparent)' }} />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full opacity-10 blur-3xl"
            style={{ background: 'radial-gradient(circle,#3b82f6,transparent)' }} />
          <div className="absolute top-1/2 left-0 w-64 h-64 rounded-full opacity-5 blur-2xl"
            style={{ background: 'radial-gradient(circle,#a855f7,transparent)' }} />

          {/* Grid overlay */}
          <div className="absolute inset-0 opacity-5"
            style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.1) 1px,transparent 1px)', backgroundSize: '40px 40px' }} />

          <div className="relative z-10 max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold text-white mb-6 border"
              style={{ background: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)' }}>
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              Powered by Gemini AI + Python NLP
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            </div>

            <h1 className="text-5xl md:text-6xl font-black text-white leading-tight mb-6">
              Get Hired{' '}
              <span style={{
                background: 'linear-gradient(90deg,#93c5fd,#c4b5fd,#f9a8d4)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                Intelligently
              </span>
            </h1>

            <p className="text-blue-100 text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
              Upload your resume. Our AI extracts your skills, calculates <strong className="text-white">semantic similarity scores</strong> using cosine analysis, and ranks you fairly against every candidate.
            </p>

            <div className="flex flex-wrap gap-4 justify-center mb-14">
              <a href="#jobs"
                className="px-7 py-3.5 rounded-2xl text-sm font-bold text-blue-700 transition-all hover:-translate-y-1 hover:shadow-2xl"
                style={{ background: 'white', boxShadow: '0 8px 30px rgba(0,0,0,0.2)' }}>
                Browse Open Roles ↓
              </a>
              <a href="#how-it-works"
                className="px-7 py-3.5 rounded-2xl text-sm font-bold text-white border transition-all hover:bg-white/10"
                style={{ borderColor: 'rgba(255,255,255,0.3)' }}>
                See How It Works
              </a>
            </div>

            {/* Stats */}
            <div className={`grid grid-cols-3 gap-4 max-w-2xl mx-auto transition-all duration-700 ${
              statsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}>
              {[
                { value: 'Gemini 2.0',  label: 'AI Engine',        icon: '🤖' },
                { value: '< 30s',       label: 'Resume Analysis',   icon: '⚡' },
                { value: 'Cosine NLP',  label: 'Similarity Engine', icon: '🧪' },
              ].map(s => (
                <div key={s.label} className="rounded-2xl p-5 text-center border"
                  style={{ background: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(12px)' }}>
                  <div className="text-3xl mb-2">{s.icon}</div>
                  <div className="text-xl font-extrabold text-white">{s.value}</div>
                  <div className="text-xs text-blue-300 mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════
          HOW IT WORKS (home only)
      ══════════════════════════════════════ */}
      {isHome && (
        <section id="how-it-works" className="py-16 px-4 bg-white border-b border-gray-100">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <span className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-3 block">The Process</span>
              <h2 className="text-3xl font-extrabold text-gray-900">How AHIS Works</h2>
              <p className="text-gray-500 mt-3 max-w-xl mx-auto">From resume upload to intelligent ranking in under 30 seconds</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { step:'01', icon:'📄', title:'Upload Resume',    desc:'Submit PDF resume. We extract text instantly using pdf-parse.',                       color:'from-blue-500 to-blue-700',   bg:'#eff6ff', border:'#bfdbfe' },
                { step:'02', icon:'🧠', title:'AI Skill Extract', desc:'Gemini AI reads your resume and identifies every relevant technical skill.',          color:'from-purple-500 to-purple-700',bg:'#faf5ff', border:'#e9d5ff' },
                { step:'03', icon:'📐', title:'Cosine Scoring',   desc:'Python NLP calculates semantic similarity between your skills and job requirements.',  color:'from-indigo-500 to-indigo-700',bg:'#eef2ff', border:'#c7d2fe' },
                { step:'04', icon:'🏆', title:'Get Ranked',       desc:'You receive a live score. Top candidates are shortlisted and invited for MCQ tests.',  color:'from-green-500 to-green-700',  bg:'#f0fdf4', border:'#bbf7d0' },
              ].map((item, i) => (
                <div key={i} className="rounded-2xl p-6 relative overflow-hidden group hover:-translate-y-1 hover:shadow-xl transition-all duration-300 border"
                  style={{ background: item.bg, borderColor: item.border }}>
                  <div className="absolute top-3 right-4 text-6xl font-black opacity-10 text-gray-400 select-none">{item.step}</div>
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center text-xl mb-4 shadow-lg`}>
                    {item.icon}
                  </div>
                  {i < 3 && (
                    <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 text-gray-300 text-xl">→</div>
                  )}
                  <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════
          TECH STACK (home only)
      ══════════════════════════════════════ */}
      {isHome && (
        <section id="tech-stack" className="py-16 px-4"
          style={{ background: 'linear-gradient(135deg,#0f172a,#1e3a8a)' }}>
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <span className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-3 block">Under The Hood</span>
              <h2 className="text-3xl font-extrabold text-white">Technology Stack</h2>
              <p className="text-blue-300 mt-3">Built with production-grade tools for intelligent, fair hiring</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { icon:'🤖', name:'Gemini 2.0 Flash', desc:'Skill extraction & MCQ generation', tag:'AI' },
                { icon:'🐍', name:'Python NLP',        desc:'Cosine similarity & semantic ranking', tag:'Backend' },
                { icon:'📐', name:'scikit-learn',      desc:'TF-IDF vectorization & scoring', tag:'ML' },
                { icon:'⚛️', name:'React + Vite',      desc:'Fast, responsive candidate UI', tag:'Frontend' },
                { icon:'🍃', name:'MongoDB Atlas',     desc:'Cloud database for candidates & jobs', tag:'Database' },
                { icon:'🔐', name:'JWT Auth',          desc:'Secure role-based access control', tag:'Security' },
              ].map((t, i) => (
                <div key={i} className="rounded-2xl p-5 border hover:border-blue-400 group transition-all duration-300 hover:-translate-y-1"
                  style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' }}>
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-2xl">{t.icon}</span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full text-blue-300"
                      style={{ background: 'rgba(59,130,246,0.2)', border: '1px solid rgba(59,130,246,0.3)' }}>
                      {t.tag}
                    </span>
                  </div>
                  <p className="font-bold text-white text-sm">{t.name}</p>
                  <p className="text-xs text-blue-300 mt-1 leading-relaxed">{t.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════
          JOBS OUTLET
      ══════════════════════════════════════ */}
      <main id="jobs" className="flex-1">
        <Outlet />
      </main>

      {/* ══════════════════════════════════════
          FAQ (home only)
      ══════════════════════════════════════ */}
      {isHome && (
        <section id="faq" className="bg-white border-t border-gray-100 py-16 px-4">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-10">
              <span className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-3 block">Got Questions?</span>
              <h2 className="text-3xl font-extrabold text-gray-900">Frequently Asked</h2>
            </div>
            <div className="space-y-3">
              {[
                { q:'Is my resume data private?',          a:'Yes. Your resume text is processed by AI and deleted immediately after analysis. Only skill scores are stored.' },
                { q:'How is the semantic score calculated?',a:'Python NLP uses TF-IDF vectors and cosine similarity to compare your skills against job requirements — giving an objective 0–100 score.' },
                { q:'What is the validation MCQ test?',    a:'Shortlisted candidates receive a 5-question technical test generated by Gemini AI. Your answers update your final score in real time.' },
                { q:'Can I apply to multiple jobs?',       a:'Yes! Each application is independent and analyzed specifically against that job\'s required skills.' },
                { q:'How is bias prevented?',              a:'Recruiters can enable Blind Mode to hide names and emails, and our scoring is purely skill-based — no personal details affect your rank.' },
              ].map((item, i) => <FaqItem key={i} q={item.q} a={item.a} />)}
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════
          FOOTER
      ══════════════════════════════════════ */}
      <footer style={{ background: 'linear-gradient(135deg,#0f172a,#1e3a8a)' }} className="text-gray-400 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-sm"
                style={{ background: 'linear-gradient(135deg,#3b82f6,#6366f1)', boxShadow: '0 0 16px rgba(99,102,241,0.4)' }}>
                AI
              </div>
              <div>
                <p className="text-white font-bold">AHIS</p>
                <p className="text-xs text-blue-400">Autonomous Hiring Intelligence System</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-6 text-sm">
              <Link to="/" className="hover:text-white transition">Jobs</Link>
              <a href="#how-it-works" className="hover:text-white transition">How It Works</a>
              <a href="#tech-stack" className="hover:text-white transition">Tech Stack</a>
              <a href="#faq" className="hover:text-white transition">FAQ</a>
              <Link to="/login" className="hover:text-white transition">Recruiter Login</Link>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 transition cursor-pointer text-sm"
                style={{ border: '1px solid rgba(255,255,255,0.1)' }}>⭐</div>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 transition cursor-pointer text-sm"
                style={{ border: '1px solid rgba(255,255,255,0.1)' }}>🐙</div>
            </div>
          </div>
          <div className="border-t mt-8 pt-6 flex flex-col md:flex-row items-center justify-between text-xs text-blue-500 gap-2"
            style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
            <p>© {new Date().getFullYear()} AHIS. All rights reserved.</p>
            <p>Powered by Gemini AI · Python NLP · Cosine Similarity · React</p>
          </div>
        </div>
      </footer>

      {/* Shimmer animation */}
      <style>{`
        @keyframes shimmer {
          0%   { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
      `}</style>
    </div>
  );
}

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl overflow-hidden transition-all duration-300"
      style={{ border: open ? '1px solid #bfdbfe' : '1px solid #e2e8f0', background: open ? '#eff6ff' : '#fff' }}>
      <button onClick={() => setOpen(!open)}
        className="w-full text-left px-5 py-4 flex items-center justify-between transition-all">
        <span className="font-semibold text-gray-800 text-sm pr-4">{q}</span>
        <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold transition-all duration-300 ${open ? 'rotate-45' : ''}`}
          style={{ background: 'linear-gradient(135deg,#3b82f6,#6366f1)' }}>
          +
        </span>
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${open ? 'max-h-40' : 'max-h-0'}`}>
        <p className="px-5 pb-4 text-sm text-gray-600 leading-relaxed border-t border-blue-100 pt-3">{a}</p>
      </div>
    </div>
  );
}
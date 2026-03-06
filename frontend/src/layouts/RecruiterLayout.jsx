import React, { useState, useEffect, useRef } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';

// ── Nav Item ──────────────────────────────────────────────────────────────────
const NavItem = ({ to, icon, label, badge, collapsed }) => (
  <NavLink to={to}
    className={({ isActive }) =>
      `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative ${
        isActive
          ? 'text-white shadow-lg'
          : 'text-blue-100 hover:bg-white/10 hover:text-white'
      }`
    }
    style={({ isActive }) => isActive
      ? { background: 'linear-gradient(135deg,rgba(255,255,255,0.25),rgba(255,255,255,0.1))', border: '1px solid rgba(255,255,255,0.2)' }
      : { border: '1px solid transparent' }
    }
  >
    <span className="text-lg flex-shrink-0">{icon}</span>
    {!collapsed && <span className="flex-1 truncate">{label}</span>}
    {!collapsed && badge && (
      <span className="text-xs font-bold px-1.5 py-0.5 rounded-full bg-green-400 text-white">{badge}</span>
    )}
    {collapsed && (
      <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
        {label}
      </div>
    )}
  </NavLink>
);

// ── Stat Mini Card ────────────────────────────────────────────────────────────
const MiniStat = ({ icon, label, value, color }) => (
  <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
    style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
    <span className="text-base">{icon}</span>
    <div>
      <p className="text-xs text-blue-300 leading-none">{label}</p>
      <p className="text-sm font-bold text-white leading-none mt-0.5">{value}</p>
    </div>
  </div>
);

export default function RecruiterLayout() {
  const { user, logout }   = useAuth();
  const navigate           = useNavigate();
  const location           = useLocation();
  const [collapsed, setCollapsed]   = useState(false);
  const [notifOpen, setNotifOpen]   = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [time, setTime]             = useState(new Date());
  const [jobs, setJobs]             = useState([]);
  const notifRef   = useRef();
  const profileRef = useRef();

  // Live clock
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Fetch jobs for sidebar stats
  useEffect(() => {
    api.get('/jobs').then(r => setJobs(r.data)).catch(() => {});
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current   && !notifRef.current.contains(e.target))   setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => { logout(); navigate('/login'); };

  // Breadcrumb from path
  const crumbs = location.pathname.split('/').filter(Boolean).map(s =>
    s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g,' ')
  );

  const navSections = [
    {
      label: 'MAIN',
      items: [
        { to: '/recruiter/dashboard', icon: '📊', label: 'Dashboard' },
        { to: '/recruiter/create-job', icon: '➕', label: 'Create Job' },
      ]
    },
    {
      label: 'TOOLS',
      items: [
        { to: '/', icon: '🌐', label: 'Job Board' },
      ]
    }
  ];

  const notifications = [
    { icon: '🤖', title: 'AI Analysis Complete', desc: 'Resume scored for Senior React Dev', time: '2m ago', color: '#dbeafe' },
    { icon: '👤', title: 'New Application',       desc: 'John applied for ML Engineer',      time: '14m ago', color: '#dcfce7' },
    { icon: '🧪', title: 'Test Submitted',        desc: 'Candidate completed validation MCQ', time: '1h ago', color: '#fef9c3' },
    { icon: '📊', title: 'Score Updated',         desc: 'Final score recalculated → 87%',    time: '2h ago', color: '#f3e8ff' },
  ];

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#f0f4ff' }}>

      {/* ══════════════════════════
          SIDEBAR
      ══════════════════════════ */}
      <aside
        className="flex flex-col h-full flex-shrink-0 transition-all duration-300"
        style={{
          width: collapsed ? 68 : 240,
          background: 'linear-gradient(160deg,#0f172a 0%,#1e3a8a 55%,#1d4ed8 100%)',
          borderRight: '1px solid rgba(99,132,255,0.2)',
          boxShadow: '4px 0 24px rgba(29,78,216,0.2)',
        }}
      >
        {/* Brand */}
        <div className="flex items-center gap-3 px-4 py-5"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-sm flex-shrink-0"
            style={{ background: 'linear-gradient(135deg,#3b82f6,#6366f1)', boxShadow: '0 0 16px rgba(99,102,241,0.5)' }}>
            AI
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <p className="text-white font-black text-base leading-none">AHIS</p>
              <p className="text-xs leading-none mt-1"
                style={{ background: 'linear-gradient(90deg,#93c5fd,#c4b5fd)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Recruiter Portal
              </p>
            </div>
          )}
        </div>

        {/* Live Clock (when expanded) */}
        {!collapsed && (
          <div className="mx-3 mt-3 rounded-xl px-3 py-2.5 text-center"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <p className="text-white font-mono font-bold text-lg leading-none">
              {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </p>
            <p className="text-blue-300 text-xs mt-1">
              {time.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
            </p>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-4 overflow-y-auto">
          {navSections.map(section => (
            <div key={section.label}>
              {!collapsed && (
                <p className="text-xs font-bold tracking-widest mb-2 px-1"
                  style={{ color: 'rgba(255,255,255,0.35)' }}>
                  {section.label}
                </p>
              )}
              <div className="space-y-1">
                {section.items.map(item => (
                  <NavItem key={item.to} {...item} collapsed={collapsed} />
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Quick Stats (when expanded) */}
        {!collapsed && (
          <div className="px-3 pb-3 space-y-2">
            <p className="text-xs font-bold tracking-widest px-1 mb-2"
              style={{ color: 'rgba(255,255,255,0.35)' }}>
              QUICK STATS
            </p>
            <MiniStat icon="💼" label="Active Jobs"   value={jobs.length || '—'} />
            <MiniStat icon="🤖" label="AI Engine"     value="spaCy" />
            <MiniStat icon="⚡" label="Status"        value="Online" />
          </div>
        )}

        {/* User Card */}
        <div className="px-3 pb-4" style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 12 }}>
          {!collapsed ? (
            <div className="rounded-xl p-3 flex items-center gap-3"
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                style={{ background: 'linear-gradient(135deg,#3b82f6,#a855f7)' }}>
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-white text-xs font-semibold truncate">{user?.name}</p>
                <p className="text-blue-300 text-xs truncate">{user?.email}</p>
              </div>
              <button onClick={handleLogout}
                className="text-red-400 hover:text-red-300 transition text-sm" title="Logout">
                🚪
              </button>
            </div>
          ) : (
            <button onClick={handleLogout}
              className="w-full flex items-center justify-center py-2 rounded-xl text-red-400 hover:bg-white/10 transition text-lg"
              title="Logout">
              🚪
            </button>
          )}
        </div>
      </aside>

      {/* ══════════════════════════
          MAIN AREA
      ══════════════════════════ */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* ── Topbar ── */}
        <header className="flex-shrink-0 flex items-center justify-between px-6 py-3"
          style={{
            background: 'white',
            borderBottom: '1px solid #e2e8f0',
            boxShadow: '0 2px 16px rgba(59,130,246,0.06)',
          }}>

          {/* Left: collapse + breadcrumb */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-105"
              style={{ background: '#eff6ff', border: '1px solid #bfdbfe', color: '#2563eb' }}
            >
              {collapsed ? '→' : '←'}
            </button>
            <div>
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                {crumbs.map((c, i) => (
                  <React.Fragment key={i}>
                    {i > 0 && <span>/</span>}
                    <span className={i === crumbs.length - 1 ? 'text-blue-600 font-semibold' : ''}>{c}</span>
                  </React.Fragment>
                ))}
              </div>
              <p className="text-lg font-bold text-gray-900 leading-tight">
                {crumbs[crumbs.length - 1]}
              </p>
            </div>
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-2">

            {/* AI Status badge */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold"
              style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d' }}>
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              AI Active
            </div>

            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}
                className="relative w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-105"
                style={{ background: '#eff6ff', border: '1px solid #bfdbfe' }}
              >
                🔔
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white" />
              </button>

              {notifOpen && (
                <div className="absolute right-0 top-12 w-80 rounded-2xl overflow-hidden z-50"
                  style={{ background: 'white', border: '1px solid #e2e8f0', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
                  <div className="px-4 py-3 flex items-center justify-between"
                    style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <p className="font-bold text-gray-800 text-sm">Notifications</p>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white"
                      style={{ background: 'linear-gradient(135deg,#3b82f6,#6366f1)' }}>
                      {notifications.length} new
                    </span>
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {notifications.map((n, i) => (
                      <div key={i} className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer transition"
                        style={{ borderBottom: '1px solid #f8fafc' }}>
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-base"
                          style={{ background: n.color }}>
                          {n.icon}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-800">{n.title}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{n.desc}</p>
                        </div>
                        <span className="text-xs text-gray-400 whitespace-nowrap">{n.time}</span>
                      </div>
                    ))}
                  </div>
                  <div className="px-4 py-2.5 text-center"
                    style={{ borderTop: '1px solid #f1f5f9' }}>
                    <button className="text-xs font-semibold text-blue-600 hover:underline">
                      Mark all as read
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Profile dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
                className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all hover:scale-105"
                style={{ background: '#eff6ff', border: '1px solid #bfdbfe' }}
              >
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
                  style={{ background: 'linear-gradient(135deg,#3b82f6,#a855f7)' }}>
                  {user?.name?.[0]?.toUpperCase()}
                </div>
                <span className="text-sm font-semibold text-gray-700 hidden sm:block">
                  {user?.name?.split(' ')[0]}
                </span>
                <span className="text-gray-400 text-xs">▾</span>
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-12 w-64 rounded-2xl overflow-hidden z-50"
                  style={{ background: 'white', border: '1px solid #e2e8f0', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
                  {/* Profile header */}
                  <div className="px-4 py-4 text-center"
                    style={{ background: 'linear-gradient(135deg,#eff6ff,#f5f3ff)', borderBottom: '1px solid #e2e8f0' }}>
                    <div className="w-14 h-14 rounded-full mx-auto flex items-center justify-center text-white text-xl font-bold mb-2"
                      style={{ background: 'linear-gradient(135deg,#3b82f6,#a855f7)' }}>
                      {user?.name?.[0]?.toUpperCase()}
                    </div>
                    <p className="font-bold text-gray-900">{user?.name}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                    <span className="inline-block mt-2 text-xs font-semibold px-3 py-1 rounded-full text-white"
                      style={{ background: 'linear-gradient(135deg,#3b82f6,#6366f1)' }}>
                      Recruiter
                    </span>
                  </div>
                  <div className="p-2">
                    {[
                      { icon: '📊', label: 'Dashboard',  action: () => { navigate('/recruiter/dashboard'); setProfileOpen(false); } },
                      { icon: '➕', label: 'Create Job',  action: () => { navigate('/recruiter/create-job'); setProfileOpen(false); } },
                      { icon: '🌐', label: 'View Job Board', action: () => { navigate('/'); setProfileOpen(false); } },
                    ].map((item, i) => (
                      <button key={i} onClick={item.action}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition text-left">
                        <span>{item.icon}</span> {item.label}
                      </button>
                    ))}
                    <div style={{ borderTop: '1px solid #f1f5f9', marginTop: 4, paddingTop: 4 }}>
                      <button onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 transition text-left">
                        🚪 Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ── Scrollable Page Content ── */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>

        {/* ── Footer bar ── */}
        <div className="flex-shrink-0 flex items-center justify-between px-6 py-2 text-xs text-gray-400"
          style={{ background: 'white', borderTop: '1px solid #f1f5f9' }}>
          <span>© {new Date().getFullYear()} AHIS · Autonomous Hiring Intelligence</span>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
               AI NLP Online
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
              MongoDB Connected
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
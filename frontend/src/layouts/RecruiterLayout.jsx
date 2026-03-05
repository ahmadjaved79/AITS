import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NavItem = ({ to, icon, label }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${
        isActive ? 'bg-primary text-white' : 'text-gray-600 hover:bg-primary-50 hover:text-primary'
      }`
    }
  >
    <span className="text-lg">{icon}</span>
    {label}
  </NavLink>
);

export default function RecruiterLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(true);

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className={`${open ? 'w-56' : 'w-16'} bg-white border-r border-gray-200 flex flex-col transition-all duration-200`}>
        <div className="p-4 border-b border-gray-100 flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0">A</div>
          {open && <span className="font-bold text-gray-900 text-sm">AHIS</span>}
        </div>
        <nav className="flex-1 p-3 space-y-1">
          <NavItem to="/recruiter/dashboard" icon="📊" label={open ? 'Dashboard' : ''} />
          <NavItem to="/recruiter/create-job" icon="➕" label={open ? 'Create Job' : ''} />
          <NavItem to="/" icon="👁" label={open ? 'Job Board' : ''} />
        </nav>
        <div className="p-3 border-t border-gray-100">
          {open && <p className="text-xs text-gray-500 mb-2 truncate">{user?.name}</p>}
          <button onClick={handleLogout} className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg">
            🚪 {open && 'Logout'}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <button onClick={() => setOpen(!open)} className="text-gray-500 hover:text-gray-700">☰</button>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">Recruiter</span>
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold">
              {user?.name?.[0]?.toUpperCase()}
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
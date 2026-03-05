import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';

export default function CandidateLayout() {
  const loc = useLocation();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">A</div>
            <span className="font-bold text-gray-900 text-lg">AHIS</span>
            <span className="text-xs text-gray-400 hidden sm:block">Hiring Intelligence</span>
          </Link>
          <nav className="flex items-center gap-1">
            <Link to="/"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition ${loc.pathname === '/' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}>
              Jobs
            </Link>
            <Link to="/login"
              className="ml-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition">
              Recruiter Login
            </Link>
          </nav>
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-4 text-center text-xs text-gray-400">
        © {new Date().getFullYear()} AHIS — Autonomous Hiring Intelligence System
      </footer>
    </div>
  );
}
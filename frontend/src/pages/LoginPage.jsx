import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';

export function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

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
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl font-bold">A</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">AHIS</h1>
          <p className="text-gray-500 text-sm mt-1">Recruiter Login</p>
        </div>
        {err && <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg p-3 mb-4">{err}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Email</label>
            <input className="input" type="email" placeholder="recruiter@ahis.com"
              value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div>
            <label className="label">Password</label>
            <input className="input" type="password" placeholder="••••••••"
              value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
          </div>
          <button type="submit" disabled={loading}
            className="w-full btn-primary py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p className="text-center text-xs text-gray-400 mt-6">
          First time? Run <code className="bg-gray-100 px-1 rounded">POST /api/auth/seed</code> to create the default recruiter.
        </p>
      </div>
    </div>
  );
}
export default LoginPage;

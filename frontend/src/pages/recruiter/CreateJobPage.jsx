import React2, { useState as useState2 } from 'react';
import { useNavigate } from 'react-router-dom';
import api2 from '../../api';

export function CreateJobPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState2({
    title: '', description: '', requiredSkills: '',
    weights: { semantic: 0.6, impact: 0.2, validation: 0.2 },
  });
  const [loading, setLoading] = useState2(false);
  const [err, setErr] = useState2('');

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const setWeight = (k, v) => setForm(p => ({ ...p, weights: { ...p.weights, [k]: parseFloat(v) } }));

  const handleSubmit = async (e) => {
    e.preventDefault(); setErr(''); setLoading(true);
    try {
      await api2.post('/jobs/create', {
        ...form,
        requiredSkills: form.requiredSkills.split(',').map(s => s.trim()).filter(Boolean),
      });
      navigate('/recruiter/dashboard');
    } catch (e) { setErr(e.response?.data?.error || 'Failed to create job'); }
    finally { setLoading(false); }
  };

  const totalW = Object.values(form.weights).reduce((a, b) => a + b, 0).toFixed(1);

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Job</h1>
      {err && <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg p-3 mb-4">{err}</div>}
      <form onSubmit={handleSubmit} className="card space-y-5">
        <div>
          <label className="label">Job Title</label>
          <input className="input" placeholder="e.g. Senior React Developer" value={form.title}
            onChange={e => set('title', e.target.value)} required />
        </div>
        <div>
          <label className="label">Job Description</label>
          <textarea className="input" rows={4} placeholder="Describe the role, responsibilities, expectations..."
            value={form.description} onChange={e => set('description', e.target.value)} required />
        </div>
        <div>
          <label className="label">Required Skills <span className="text-gray-400 font-normal">(comma-separated)</span></label>
          <input className="input" placeholder="React, TypeScript, Node.js, AWS" value={form.requiredSkills}
            onChange={e => set('requiredSkills', e.target.value)} />
        </div>
        <div>
          <label className="label">Score Weights <span className={`text-xs ${Math.abs(parseFloat(totalW) - 1) > 0.01 ? 'text-red-500' : 'text-green-500'}`}>(total: {totalW})</span></label>
          <div className="grid grid-cols-3 gap-3 mt-2">
            {['semantic', 'impact', 'validation'].map(k => (
              <div key={k}>
                <label className="text-xs text-gray-500 capitalize">{k}</label>
                <input type="number" className="input mt-1 text-sm" min="0" max="1" step="0.1"
                  value={form.weights[k]} onChange={e => setWeight(k, e.target.value)} />
              </div>
            ))}
          </div>
        </div>
        <button type="submit" disabled={loading} className="w-full btn-primary py-3 disabled:opacity-50">
          {loading ? 'Creating...' : 'Create Job'}
        </button>
      </form>
    </div>
  );
}
export default CreateJobPage;

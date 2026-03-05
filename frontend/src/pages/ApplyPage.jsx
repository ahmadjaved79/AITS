import React3, { useState as useState3, useEffect as useEffect3 } from 'react';
import { useParams, Link } from 'react-router-dom';
import api3 from '../api';

export function ApplyPage() {
  const { jobId } = useParams();
  const [job, setJob] = useState3(null);
  const [form, setForm] = useState3({ name: '', email: '' });
  const [file, setFile] = useState3(null);
  const [loading, setLoading] = useState3(false);
  const [result, setResult] = useState3(null);
  const [err, setErr] = useState3('');

  useEffect3(() => {
    api3.get(`/jobs/${jobId}`).then(r => setJob(r.data)).catch(() => setErr('Job not found'));
  }, [jobId]);

  const handleSubmit = async (e) => {
    e.preventDefault(); setErr(''); setLoading(true);
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('email', form.email);
      fd.append('jobId', jobId);
      fd.append('resume', file);
      const { data } = await api3.post('/apply', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setResult(data);
    } catch (e) {
      setErr(e.response?.data?.error || 'Submission failed');
    } finally { setLoading(false); }
  };

  if (result) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-lg w-full text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-green-500 text-3xl">✓</span>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Application Received!</h2>
        <p className="text-gray-500 mb-6">Our AI has analyzed your resume. Here are your results:</p>
        <div className="bg-gray-50 rounded-xl p-5 text-left space-y-4 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Semantic Match Score</span>
            <span className={`text-xl font-bold ${result.semanticScore >= 70 ? 'text-green-500' : result.semanticScore >= 40 ? 'text-yellow-500' : 'text-red-500'}`}>
              {result.semanticScore}/100
            </span>
          </div>
          {result.missingSkills?.length > 0 && (
            <div>
              <p className="text-sm text-gray-600 mb-2">Skills to Develop:</p>
              <div className="flex flex-wrap gap-2">
                {result.missingSkills.map(s => (
                  <span key={s} className="bg-orange-50 text-orange-600 text-xs px-2 py-1 rounded-full">{s}</span>
                ))}
              </div>
            </div>
          )}
          {result.summary && <p className="text-sm text-gray-600 italic">"{result.summary}"</p>}
        </div>
        {result.semanticScore >= 50 && (
          <div className="bg-blue-50 rounded-lg p-4 text-sm text-primary mb-4">
            🎯 Great match! The recruiter may invite you for a validation test.
          </div>
        )}
        <Link to="/" className="btn-primary inline-block">Back to Jobs</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-xl mx-auto">
        <Link to="/" className="text-primary text-sm hover:underline">← Back to Jobs</Link>
        {job && (
          <div className="card mt-4 mb-6">
            <h1 className="text-xl font-bold text-gray-900">{job.title}</h1>
            <p className="text-gray-500 text-sm mt-1">{job.description}</p>
            {job.requiredSkills?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {job.requiredSkills.map(s => (
                  <span key={s} className="bg-primary-light text-primary text-xs px-2 py-1 rounded-full">{s}</span>
                ))}
              </div>
            )}
          </div>
        )}
        <div className="card">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Submit Application</h2>
          {err && <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg p-3 mb-4">{err}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <input className="input" placeholder="Jane Doe" value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" placeholder="jane@example.com" value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div>
              <label className="label">Resume (PDF or DOCX, max 5MB)</label>
              <input className="input" type="file" accept=".pdf,.doc,.docx"
                onChange={e => setFile(e.target.files[0])} required />
            </div>
            <button type="submit" disabled={loading || !file}
              className="w-full btn-primary py-3 rounded-lg disabled:opacity-50">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  AI is analyzing your resume...
                </span>
              ) : 'Submit Application'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
export default ApplyPage;

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api';

const steps = ['Your Info', 'Upload Resume', 'AI Results'];

export default function ApplyPage() {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [step, setStep] = useState(0); // 0=info, 1=upload, 2=result
  const [form, setForm] = useState({ name: '', email: '' });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [err, setErr] = useState('');
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    api.get(`/jobs/${jobId}`).then(r => setJob(r.data)).catch(() => setErr('Job not found'));
  }, [jobId]);

  const handleDrop = (e) => {
    e.preventDefault(); setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) setFile(f);
  };

  const handleSubmit = async () => {
    setErr(''); setLoading(true);
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('email', form.email);
      fd.append('jobId', jobId);
      fd.append('resume', file);
      const { data } = await api.post('/apply', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setResult(data);
      setStep(2);
    } catch (e) {
      setErr(e.response?.data?.error || 'Submission failed. Please try again.');
    } finally { setLoading(false); }
  };

  // Score color helpers
  const scoreColor = (s) => s >= 70 ? '#16a34a' : s >= 40 ? '#d97706' : '#dc2626';
  const scoreBg    = (s) => s >= 70 ? '#f0fdf4' : s >= 40 ? '#fffbeb' : '#fef2f2';
  const scoreLabel = (s) => s >= 70 ? 'Strong Match' : s >= 40 ? 'Partial Match' : 'Low Match';

  if (!job && !err) return (
    <div className="flex items-center justify-center min-h-96">
      <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Back */}
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline mb-6">
        ← Back to Jobs
      </Link>

      {/* Job header */}
      {job && (
        <div className="bg-white rounded-xl border border-gray-100 p-5 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 font-bold text-lg">
              {job.title[0]}
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">{job.title}</h1>
              <p className="text-sm text-gray-500 line-clamp-1">{job.description}</p>
            </div>
          </div>
          {job.requiredSkills?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {job.requiredSkills.map(s => (
                <span key={s} className="bg-blue-50 text-blue-600 text-xs px-2 py-1 rounded-full">{s}</span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Stepper */}
      <div className="flex items-center mb-8">
        {steps.map((s, i) => (
          <React.Fragment key={s}>
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition ${
                i < step ? 'bg-green-500 text-white' :
                i === step ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'
              }`}>
                {i < step ? '✓' : i + 1}
              </div>
              <span className={`text-sm font-medium hidden sm:block ${i === step ? 'text-blue-600' : 'text-gray-400'}`}>{s}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 transition ${i < step ? 'bg-green-400' : 'bg-gray-200'}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      {err && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg p-3 mb-4">
          ⚠️ {err}
        </div>
      )}

      {/* ── Step 0: Info ── */}
      {step === 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-5">Your Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm"
                placeholder="Jane Doe" value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm"
                type="email" placeholder="jane@example.com" value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>
            <button
              onClick={() => { if (!form.name || !form.email) { setErr('Please fill in all fields'); return; } setErr(''); setStep(1); }}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition mt-2">
              Continue →
            </button>
          </div>
        </div>
      )}

      {/* ── Step 1: Upload ── */}
      {step === 1 && (
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-2">Upload Your Resume</h2>
          <p className="text-sm text-gray-500 mb-5">Our AI will analyze your resume and match it against the job requirements.</p>

          {/* Drop zone */}
          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => document.getElementById('resumeInput').click()}
            className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition ${
              dragOver ? 'border-blue-500 bg-blue-50' :
              file ? 'border-green-400 bg-green-50' : 'border-gray-200 hover:border-blue-400 hover:bg-blue-50'
            }`}>
            <input id="resumeInput" type="file" accept=".pdf,.doc,.docx" className="hidden"
              onChange={e => setFile(e.target.files[0])} />
            {file ? (
              <div>
                <div className="text-4xl mb-2">📄</div>
                <p className="font-semibold text-green-700">{file.name}</p>
                <p className="text-xs text-gray-400 mt-1">{(file.size / 1024).toFixed(1)} KB — click to change</p>
              </div>
            ) : (
              <div>
                <div className="text-4xl mb-3">📁</div>
                <p className="font-medium text-gray-700">Drag & drop your resume here</p>
                <p className="text-sm text-gray-400 mt-1">or click to browse</p>
                <p className="text-xs text-gray-300 mt-3">PDF or DOCX • Max 5MB</p>
              </div>
            )}
          </div>

          {/* AI info box */}
          <div className="bg-blue-50 rounded-lg p-4 mt-4 text-sm text-blue-700">
            <p className="font-medium mb-1">🤖 What our AI analyzes:</p>
            <ul className="space-y-0.5 text-blue-600 text-xs">
              <li>✓ Skills extraction & matching</li>
              <li>✓ Semantic similarity scoring (0–100)</li>
              <li>✓ Missing skills detection</li>
              <li>✓ Professional summary generation</li>
            </ul>
          </div>

          <div className="flex gap-3 mt-5">
            <button onClick={() => setStep(0)}
              className="flex-1 border border-gray-300 text-gray-600 py-3 rounded-lg font-medium hover:bg-gray-50 transition text-sm">
              ← Back
            </button>
            <button onClick={handleSubmit} disabled={!file || loading}
              className="flex-2 flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  AI Analyzing...
                </span>
              ) : 'Submit & Analyze →'}
            </button>
          </div>
        </div>
      )}

      {/* ── Step 2: Results ── */}
      {step === 2 && result && (
        <div className="space-y-4">
          {/* Score card */}
          <div className="bg-white rounded-xl border border-gray-100 p-6 text-center">
            <p className="text-sm text-gray-500 mb-3">Your AI Match Score</p>
            <div className="relative w-32 h-32 mx-auto mb-3">
              <svg viewBox="0 0 36 36" className="w-32 h-32 -rotate-90">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f3f4f6" strokeWidth="3" />
                <circle cx="18" cy="18" r="15.9" fill="none"
                  stroke={scoreColor(result.semanticScore)} strokeWidth="3"
                  strokeDasharray={`${result.semanticScore} 100`} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold" style={{ color: scoreColor(result.semanticScore) }}>
                  {result.semanticScore}
                </span>
                <span className="text-xs text-gray-400">/ 100</span>
              </div>
            </div>
            <span className="inline-block px-4 py-1.5 rounded-full text-sm font-semibold"
              style={{ background: scoreBg(result.semanticScore), color: scoreColor(result.semanticScore) }}>
              {scoreLabel(result.semanticScore)}
            </span>
          </div>

          {/* Summary */}
          {result.summary && (
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h3 className="font-semibold text-gray-900 mb-2">📝 AI Summary</h3>
              <p className="text-sm text-gray-600 italic leading-relaxed">"{result.summary}"</p>
            </div>
          )}

          {/* Missing skills */}
          {result.missingSkills?.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h3 className="font-semibold text-gray-900 mb-3">⚠️ Skills to Develop</h3>
              <div className="flex flex-wrap gap-2">
                {result.missingSkills.map(s => (
                  <span key={s} className="bg-orange-50 text-orange-600 border border-orange-100 text-sm px-3 py-1 rounded-full">{s}</span>
                ))}
              </div>
            </div>
          )}

          {/* Next step info */}
          <div className={`rounded-xl p-5 ${result.semanticScore >= 50 ? 'bg-blue-50 border border-blue-100' : 'bg-gray-50 border border-gray-100'}`}>
            {result.semanticScore >= 50 ? (
              <div>
                <h3 className="font-semibold text-blue-800 mb-1">🎯 What happens next?</h3>
                <p className="text-sm text-blue-700">
                  Your profile is a strong match! The recruiter will review your application and may invite you to complete a <strong>technical validation test</strong>. Check your email for an invitation link.
                </p>
              </div>
            ) : (
              <div>
                <h3 className="font-semibold text-gray-700 mb-1">📌 Keep improving</h3>
                <p className="text-sm text-gray-600">
                  Your application has been submitted. Consider building the missing skills listed above to improve your chances in future applications.
                </p>
              </div>
            )}
          </div>

          <Link to="/"
            className="block w-full text-center bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition">
            Browse More Jobs
          </Link>
        </div>
      )}
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Upload, CheckCircle, AlertCircle, FileText, Zap } from 'lucide-react';
import api from '../../api';

const steps = ['Your Info', 'Upload Resume', 'AI Results'];

export default function ApplyPage() {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [step, setStep] = useState(0);
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
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) setFile(f);
  };

  const handleSubmit = async () => {
    setErr('');
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  const scoreColor = (s) => s >= 70 ? 'text-emerald-400' : s >= 40 ? 'text-amber-400' : 'text-red-400';
  const scoreBgGradient = (s) => s >= 70 ? 'from-emerald-500/20 to-teal-500/20 border-emerald-400/30' : s >= 40 ? 'from-amber-500/20 to-orange-500/20 border-amber-400/30' : 'from-red-500/20 to-orange-500/20 border-red-400/30';
  const scoreLabel = (s) => s >= 70 ? 'Strong Match' : s >= 40 ? 'Partial Match' : 'Low Match';

  if (!job && !err) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-xl opacity-20 animate-pulse" />
          <div className="relative w-16 h-16 border-4 border-slate-700 border-t-blue-500 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Animated background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" 
          style={{ animation: 'float 8s ease-in-out infinite' }} />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" 
          style={{ animation: 'float 10s ease-in-out infinite 2s' }} />
        <div className="absolute bottom-1/4 left-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" 
          style={{ animation: 'float 12s ease-in-out infinite 4s' }} />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-200 transition duration-300 mb-8 group animate-in fade-in slide-in-from-left duration-500"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition" />
          <span className="text-sm font-medium">Back to Jobs</span>
        </Link>

        {/* Job Header Card */}
        {job && (
          <div className="group relative mb-8 animate-in fade-in slide-in-from-top duration-700 delay-100">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-xl opacity-0 group-hover:opacity-20 transition duration-500" />
            <div className="relative bg-gradient-to-br from-slate-800/60 to-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 group-hover:border-slate-600 transition duration-300">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                {/* Logo */}
                <div className="relative flex-shrink-0">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur-lg opacity-40 group-hover:opacity-60 transition duration-300" />
                  <div className="relative w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-xl">
                    {job.title[0]}
                  </div>
                </div>

                {/* Job Info */}
                <div className="flex-1">
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text text-transparent mb-1">
                    {job.title}
                  </h1>
                  <p className="text-slate-400 text-sm line-clamp-2 mb-3">
                    {job.description}
                  </p>
                  {job.requiredSkills?.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {job.requiredSkills.slice(0, 4).map(s => (
                        <span key={s} className="px-2.5 py-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-300 rounded-lg text-xs font-semibold border border-blue-400/30 backdrop-blur-md">
                          {s}
                        </span>
                      ))}
                      {job.requiredSkills.length > 4 && (
                        <span className="px-2.5 py-1 text-slate-400 text-xs font-semibold">
                          +{job.requiredSkills.length - 4}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stepper */}
        <div className="mb-10 animate-in fade-in slide-in-from-top duration-700 delay-200">
          <div className="flex items-center justify-between">
            {steps.map((s, i) => (
              <React.Fragment key={s}>
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 transform ${
                    i < step 
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/50 scale-110' 
                      : i === step 
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/50 scale-100' 
                      : 'bg-slate-700/50 border border-slate-600 text-slate-400'
                  }`}>
                    {i < step ? '✓' : i + 1}
                  </div>
                  <span className={`text-xs font-semibold mt-2 transition duration-300 ${
                    i === step ? 'text-blue-300' : i < step ? 'text-emerald-300' : 'text-slate-400'
                  }`}>
                    {s}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div className={`flex-1 h-1 mx-3 rounded-full transition-all duration-300 ${
                    i < step 
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/50' 
                      : 'bg-slate-700/50'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Error Alert */}
        {err && (
          <div className="mb-6 animate-in fade-in slide-in-from-top duration-500">
            <div className="bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-400/30 rounded-2xl p-4 flex items-start gap-3 backdrop-blur-md">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-300 text-sm">{err}</p>
            </div>
          </div>
        )}

        {/* ── Step 0: Your Info ── */}
        {step === 0 && (
          <div className="group relative animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-2xl opacity-0 group-hover:opacity-15 transition duration-500" />
            
            <div className="relative bg-gradient-to-br from-slate-800/60 to-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 group-hover:border-slate-600 transition duration-300">
              <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                <span className="text-2xl">👤</span> Your Information
              </h2>
              <p className="text-slate-400 text-sm mb-6">Let us know who you are</p>

              <div className="space-y-5">
                {/* Name Input */}
                <div className="animate-in fade-in slide-in-from-left duration-700 delay-400">
                  <label className="block text-sm font-bold text-white mb-2.5">Full Name</label>
                  <input
                    className="w-full px-5 py-3.5 bg-slate-700/40 border border-slate-600/50 text-white placeholder-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-md transition duration-300 font-medium"
                    placeholder="Jane Doe"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                  />
                </div>

                {/* Email Input */}
                <div className="animate-in fade-in slide-in-from-left duration-700 delay-500">
                  <label className="block text-sm font-bold text-white mb-2.5">Email Address</label>
                  <input
                    className="w-full px-5 py-3.5 bg-slate-700/40 border border-slate-600/50 text-white placeholder-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-md transition duration-300 font-medium"
                    type="email"
                    placeholder="jane@example.com"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                  />
                </div>

                {/* Continue Button */}
                <button
                  onClick={() => {
                    if (!form.name || !form.email) {
                      setErr('Please fill in all fields');
                      return;
                    }
                    setErr('');
                    setStep(1);
                  }}
                  className="group/btn relative w-full px-6 py-4 rounded-xl font-bold text-white overflow-hidden transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 mt-6 animate-in fade-in slide-in-from-bottom-2 duration-700 delay-600"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 opacity-100 transition duration-300" />
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 opacity-0 group-hover/btn:opacity-100 transition duration-300 blur" />
                  
                  <span className="relative flex items-center justify-center gap-2">
                    Continue to Resume
                    <ArrowLeft className="w-5 h-5 rotate-180 group-hover/btn:translate-x-1 transition" />
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Step 1: Upload Resume ── */}
        {step === 1 && (
          <div className="group relative animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-2xl blur-2xl opacity-0 group-hover:opacity-15 transition duration-500" />
            
            <div className="relative bg-gradient-to-br from-slate-800/60 to-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 group-hover:border-slate-600 transition duration-300">
              <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                <Upload className="w-6 h-6 text-cyan-400" />
                Upload Your Resume
              </h2>
              <p className="text-slate-400 text-sm mb-6">
                Our AI will analyze your resume and match it against job requirements.
              </p>

              {/* Drop Zone */}
              <div
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => document.getElementById('resumeInput').click()}
                className={`relative group/drop border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 ${
                  dragOver
                    ? 'border-cyan-400 bg-gradient-to-br from-cyan-500/20 to-blue-500/20'
                    : file
                    ? 'border-emerald-400 bg-gradient-to-br from-emerald-500/20 to-teal-500/20'
                    : 'border-slate-600 hover:border-blue-400 hover:bg-slate-700/20'
                }`}
              >
                <input
                  id="resumeInput"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  onChange={e => setFile(e.target.files[0])}
                />

                {file ? (
                  <div className="animate-in fade-in duration-300">
                    <FileText className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                    <p className="font-bold text-emerald-300 text-lg">{file.name}</p>
                    <p className="text-xs text-slate-400 mt-2">
                      {(file.size / 1024).toFixed(1)} KB — click to change
                    </p>
                    <div className="mt-4 inline-block px-4 py-2 rounded-lg bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold">
                      ✓ File selected
                    </div>
                  </div>
                ) : (
                  <div className="animate-in fade-in duration-300">
                    <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4 group-hover/drop:text-blue-400 transition" />
                    <p className="font-bold text-white text-lg">Drag & drop your resume</p>
                    <p className="text-sm text-slate-400 mt-2">or click to browse your files</p>
                    <p className="text-xs text-slate-500 mt-4">
                      📄 PDF or DOCX • Max 5MB
                    </p>
                  </div>
                )}
              </div>

              {/* AI Info Box */}
              <div className="mt-6 p-5 rounded-xl bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-400/20 backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 duration-700 delay-300">
                <p className="font-bold text-blue-300 text-sm mb-3 flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  What our AI analyzes:
                </p>
                <ul className="space-y-2 text-xs text-blue-200">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                    Skills extraction & matching
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                    Semantic similarity scoring (0–100)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                    Missing skills detection
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                    Professional summary generation
                  </li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-8 animate-in fade-in slide-in-from-bottom-2 duration-700 delay-400">
                <button
                  onClick={() => setStep(0)}
                  className="flex-1 px-6 py-3 rounded-xl font-bold text-slate-300 border border-slate-600/50 hover:bg-slate-700/50 hover:border-slate-600 transition duration-300 transform hover:scale-105"
                >
                  ← Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!file || loading}
                  className={`flex-1 relative px-6 py-3 rounded-xl font-bold text-white overflow-hidden transition-all duration-300 transform ${
                    !file || loading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 hover:-translate-y-1'
                  }`}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 opacity-100 transition duration-300" />
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 opacity-0 group-hover:opacity-100 transition duration-300 blur" />
                  
                  <span className="relative flex items-center justify-center gap-2">
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        AI Analyzing...
                      </>
                    ) : (
                      <>
                        Submit & Analyze
                        <ArrowLeft className="w-4 h-4 rotate-180" />
                      </>
                    )}
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Step 2: Results ── */}
        {step === 2 && result && (
          <div className="space-y-5">
            {/* Score Card */}
            <div className="group relative animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl blur-2xl opacity-0 group-hover:opacity-20 transition duration-500" />
              
              <div className="relative bg-gradient-to-br from-slate-800/60 to-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 text-center group-hover:border-slate-600 transition duration-300">
                <p className="text-slate-400 text-sm mb-6">Your AI Match Score</p>
                
                {/* Circular Score */}
                <div className="relative w-40 h-40 mx-auto mb-6">
                  <svg viewBox="0 0 36 36" className="w-40 h-40 -rotate-90 drop-shadow-lg">
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#334155" strokeWidth="3" />
                    <circle
                      cx="18"
                      cy="18"
                      r="15.9"
                      fill="none"
                      stroke={result.semanticScore >= 70 ? '#10b981' : result.semanticScore >= 40 ? '#f59e0b' : '#ef4444'}
                      strokeWidth="3"
                      strokeDasharray={`${result.semanticScore} 100`}
                      strokeLinecap="round"
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`text-5xl font-bold ${scoreColor(result.semanticScore)}`}>
                      {result.semanticScore}
                    </span>
                    <span className="text-xs text-slate-400">/ 100</span>
                  </div>
                </div>

                {/* Status Badge */}
                <div className={`inline-block px-5 py-2 rounded-full text-sm font-bold border bg-gradient-to-r ${scoreBgGradient(result.semanticScore)}`}>
                  {scoreLabel(result.semanticScore)}
                </div>
              </div>
            </div>

            {/* AI Summary */}
            {result.summary && (
              <div className="group relative animate-in fade-in slide-in-from-bottom-4 duration-700 delay-400">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur-xl opacity-0 group-hover:opacity-15 transition duration-500" />
                
                <div className="relative bg-gradient-to-br from-slate-800/60 to-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 group-hover:border-slate-600 transition duration-300">
                  <h3 className="font-bold text-white mb-3 flex items-center gap-2">
                    <span className="text-lg">✨</span> AI Summary
                  </h3>
                  <p className="text-slate-300 italic leading-relaxed text-sm">"{result.summary}"</p>
                </div>
              </div>
            )}

            {/* Missing Skills */}
            {result.missingSkills?.length > 0 && (
              <div className="group relative animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl blur-xl opacity-0 group-hover:opacity-15 transition duration-500" />
                
                <div className="relative bg-gradient-to-br from-slate-800/60 to-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 group-hover:border-slate-600 transition duration-300">
                  <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                    <span className="text-lg">⚠️</span> Skills to Develop
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {result.missingSkills.map((s, i) => (
                      <span
                        key={s}
                        className="px-3 py-1.5 bg-gradient-to-r from-orange-500/20 to-red-500/20 text-orange-300 rounded-lg text-xs font-semibold border border-orange-400/30 backdrop-blur-md hover:from-orange-500/40 hover:to-red-500/40 transition animate-in fade-in duration-500"
                        style={{ animationDelay: `${i * 50}ms` }}
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Next Steps */}
            <div className={`group relative animate-in fade-in slide-in-from-bottom-4 duration-700 delay-600 rounded-2xl overflow-hidden`}>
              <div className={`absolute inset-0 ${
                result.semanticScore >= 50
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600'
                  : 'bg-gradient-to-r from-slate-600 to-slate-700'
              } blur-xl opacity-0 group-hover:opacity-20 transition duration-500`} />

              <div className={`relative bg-gradient-to-br ${
                result.semanticScore >= 50
                  ? 'from-blue-500/20 to-cyan-500/20 border-blue-400/30'
                  : 'from-slate-700/40 to-slate-700/20 border-slate-600/50'
              } backdrop-blur-xl border rounded-2xl p-6 group-hover:border-opacity-80 transition duration-300`}>
                {result.semanticScore >= 50 ? (
                  <div>
                    <h3 className="font-bold text-blue-300 mb-2 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      What Happens Next?
                    </h3>
                    <p className="text-sm text-blue-200 leading-relaxed">
                      Your profile is a strong match! The recruiter will review your application and may invite you to complete a <span className="font-semibold">technical validation test</span>. Check your email for an invitation link.
                    </p>
                  </div>
                ) : (
                  <div>
                    <h3 className="font-bold text-slate-300 mb-2 flex items-center gap-2">
                      <Zap className="w-5 h-5" />
                      Keep Improving
                    </h3>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      Your application has been submitted. Consider building the missing skills listed above to improve your chances in future applications.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Browse More Button */}
            <Link
              to="/"
              className="group/btn relative block w-full px-6 py-4 rounded-xl font-bold text-white overflow-hidden transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 text-center mt-2 animate-in fade-in slide-in-from-bottom-2 duration-700 delay-700"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 opacity-100 transition duration-300" />
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 opacity-0 group-hover/btn:opacity-100 transition duration-300 blur" />
              
              <span className="relative flex items-center justify-center gap-2">
                Browse More Jobs
                <ArrowLeft className="w-5 h-5 rotate-180 group-hover/btn:translate-x-1 transition" />
              </span>
            </Link>
          </div>
        )}
      </div>

      {/* Custom Animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0px); }
          50% { transform: translate(0, 30px); }
        }
      `}</style>
    </div>
  );
}
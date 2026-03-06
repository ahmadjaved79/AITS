import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle, AlertCircle, Briefcase, Zap } from 'lucide-react';
import api from '../../api';

export function CreateJobPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    description: '',
    requiredSkills: '',
    weights: { semantic: 0.6, impact: 0.2, validation: 0.2 },
  });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [success, setSuccess] = useState(false);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const setWeight = (k, v) => setForm(p => ({ ...p, weights: { ...p.weights, [k]: parseFloat(v) } }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      await api.post('/jobs/create', {
        ...form,
        requiredSkills: form.requiredSkills.split(',').map(s => s.trim()).filter(Boolean),
      });
      setSuccess(true);
      setTimeout(() => navigate('/recruiter/dashboard'), 1500);
    } catch (e) {
      setErr(e.response?.data?.error || 'Failed to create job');
    } finally {
      setLoading(false);
    }
  };

  const totalW = Object.values(form.weights).reduce((a, b) => a + b, 0).toFixed(2);
  const isWeightValid = Math.abs(parseFloat(totalW) - 1) < 0.01;
  const isFormValid = form.title && form.description && isWeightValid;

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
      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-10 animate-in fade-in slide-in-from-top duration-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 text-white">
              <Briefcase className="w-6 h-6" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-300 via-purple-300 to-cyan-300 bg-clip-text text-transparent">
              Create New Job
            </h1>
          </div>
          <p className="text-slate-400 text-lg">
            Post a new opportunity and set up AI-powered screening criteria
          </p>
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

        {/* Success Alert */}
        {success && (
          <div className="mb-6 animate-in fade-in duration-500">
            <div className="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-400/30 rounded-2xl p-4 flex items-start gap-3 backdrop-blur-md">
              <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <p className="text-emerald-300 text-sm">Job created successfully! Redirecting...</p>
            </div>
          </div>
        )}

        {/* Main Form Card */}
        <div className="group relative animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 rounded-3xl blur-2xl opacity-0 group-hover:opacity-15 transition duration-500" />
          
          <div className="relative bg-gradient-to-br from-slate-800/60 to-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 lg:p-10 group-hover:border-slate-600 transition duration-300">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Job Title */}
              <div className="animate-in fade-in slide-in-from-left duration-700 delay-300">
                <label className="block text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-blue-400" />
                  Job Title
                </label>
                <input
                  className="w-full px-5 py-3.5 bg-slate-700/40 border border-slate-600/50 text-white placeholder-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-md transition duration-300 font-medium"
                  placeholder="e.g. Senior React Developer"
                  value={form.title}
                  onChange={e => set('title', e.target.value)}
                  required
                />
              </div>

              {/* Job Description */}
              <div className="animate-in fade-in slide-in-from-left duration-700 delay-400">
                <label className="block text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <span className="text-lg">📝</span>
                  Job Description
                </label>
                <textarea
                  className="w-full px-5 py-3.5 bg-slate-700/40 border border-slate-600/50 text-white placeholder-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-md transition duration-300 font-medium resize-none"
                  rows={5}
                  placeholder="Describe the role, responsibilities, expectations, and what makes an ideal candidate..."
                  value={form.description}
                  onChange={e => set('description', e.target.value)}
                  required
                />
                <p className="text-xs text-slate-400 mt-2">📌 Be detailed for better AI screening accuracy</p>
              </div>

              {/* Required Skills */}
              <div className="animate-in fade-in slide-in-from-left duration-700 delay-500">
                <label className="block text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <span className="text-lg">⚡</span>
                  Required Skills <span className="text-xs font-normal text-slate-400">(comma-separated)</span>
                </label>
                <input
                  className="w-full px-5 py-3.5 bg-slate-700/40 border border-slate-600/50 text-white placeholder-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent backdrop-blur-md transition duration-300 font-medium"
                  placeholder="React, TypeScript, Node.js, AWS, Docker"
                  value={form.requiredSkills}
                  onChange={e => set('requiredSkills', e.target.value)}
                />
                <div className="mt-3 flex flex-wrap gap-2">
                  {form.requiredSkills
                    .split(',')
                    .map(s => s.trim())
                    .filter(Boolean)
                    .slice(0, 6)
                    .map((skill, i) => (
                      <span
                        key={skill}
                        className="px-3 py-1 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 rounded-lg text-xs font-semibold border border-cyan-400/30 backdrop-blur-md animate-in fade-in duration-300"
                        style={{ animationDelay: `${i * 50}ms` }}
                      >
                        ✓ {skill}
                      </span>
                    ))}
                  {form.requiredSkills.split(',').filter(s => s.trim()).length > 6 && (
                    <span className="px-3 py-1 text-slate-400 text-xs font-semibold">
                      +{form.requiredSkills.split(',').filter(s => s.trim()).length - 6} more
                    </span>
                  )}
                </div>
              </div>

              {/* Score Weights Section */}
              <div className="pt-6 border-t border-slate-700/50 animate-in fade-in slide-in-from-left duration-700 delay-600">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-400" />
                    <label className="text-sm font-bold text-white">Score Weights</label>
                  </div>
                  <div className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 ${
                    isWeightValid
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                      : 'bg-red-500/20 text-red-300 border border-red-400/30'
                  }`}>
                    <span className={isWeightValid ? '✓' : '⚠️'}></span>
                    Total: {totalW}
                  </div>
                </div>

                <p className="text-xs text-slate-400 mb-5">
                  🎯 Adjust how AI weights different evaluation criteria. Total must equal 1.0
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  {[
                    { key: 'semantic', label: 'Semantic Match', icon: '🧠', desc: 'Resume matching', color: 'from-blue-500 to-cyan-500' },
                    { key: 'impact', label: 'Impact', icon: '🎯', desc: 'Potential impact', color: 'from-purple-500 to-pink-500' },
                    { key: 'validation', label: 'Validation', icon: '✅', desc: 'Test performance', color: 'from-emerald-500 to-teal-500' },
                  ].map(({ key, label, icon, desc, color }, idx) => (
                    <div
                      key={key}
                      className="group/weight p-5 rounded-xl bg-slate-700/30 border border-slate-600/50 hover:bg-slate-700/50 hover:border-slate-600 transition duration-300 animate-in fade-in duration-500"
                      style={{ animationDelay: `${600 + idx * 100}ms` }}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xl">{icon}</span>
                        <div>
                          <p className="text-sm font-bold text-white">{label}</p>
                          <p className="text-xs text-slate-400">{desc}</p>
                        </div>
                      </div>
                      <div className="relative">
                        <div className="w-full bg-slate-600/50 rounded-lg h-2 overflow-hidden">
                          <div
                            className={`h-full bg-gradient-to-r ${color} rounded-lg transition-all duration-300`}
                            style={{ width: `${form.weights[key] * 100}%` }}
                          />
                        </div>
                        <input
                          type="number"
                          className="w-full mt-3 px-3 py-2 text-center bg-slate-700/40 border border-slate-600/50 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-semibold"
                          min="0"
                          max="1"
                          step="0.05"
                          value={form.weights[key]}
                          onChange={e => setWeight(key, e.target.value)}
                        />
                        <p className="text-xs text-slate-400 text-center mt-2 font-medium">
                          {(form.weights[key] * 100).toFixed(0)}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Weight Distribution Info */}
                <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-400/20 backdrop-blur-md">
                  <p className="text-xs text-slate-300">
                    💡 <span className="font-semibold">Pro Tip:</span> Higher semantic weight emphasizes resume matching, while validation weight tests actual skills. Customize based on your hiring needs.
                  </p>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-6 border-t border-slate-700/50 animate-in fade-in slide-in-from-bottom-2 duration-700 delay-700">
                <button
                  type="submit"
                  disabled={loading || !isFormValid || success}
                  className={`w-full group/btn relative px-6 py-4 rounded-xl font-bold text-white overflow-hidden transition-all duration-300 transform flex items-center justify-center gap-2 ${
                    !isFormValid || loading
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:scale-105 hover:-translate-y-1'
                  }`}
                >
                  {/* Button gradient background */}
                  <div className={`absolute inset-0 bg-gradient-to-r ${
                    success
                      ? 'from-emerald-600 to-teal-600'
                      : 'from-blue-600 via-purple-600 to-blue-600'
                  } opacity-100 transition duration-300`} />
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 opacity-0 group-hover/btn:opacity-100 transition duration-300 blur" />
                  
                  <span className="relative flex items-center gap-2">
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Creating Job...
                      </>
                    ) : success ? (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        Job Created!
                      </>
                    ) : (
                      <>
                        Create Job Posting
                        <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition duration-300" />
                      </>
                    )}
                  </span>
                </button>

                {!isWeightValid && (
                  <p className="text-xs text-red-400 text-center mt-3 flex items-center justify-center gap-1">
                    <AlertCircle className="w-4 h-4" /> Weights must total exactly 1.0
                  </p>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
          {[
            { icon: '🤖', title: 'AI Screening', desc: 'Candidates automatically screened based on your weights' },
            { icon: '⚡', title: 'Instant Scoring', desc: 'Get real-time match scores for each application' },
          ].map((item, i) => (
            <div
              key={i}
              className="p-4 rounded-xl bg-gradient-to-br from-slate-800/40 to-slate-800/20 border border-slate-700/30 flex gap-3 items-start animate-in fade-in slide-in-from-bottom duration-700"
              style={{ animationDelay: `${800 + i * 100}ms` }}
            >
              <span className="text-2xl flex-shrink-0">{item.icon}</span>
              <div>
                <p className="text-sm font-semibold text-white">{item.title}</p>
                <p className="text-xs text-slate-400 mt-1">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
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

export default CreateJobPage;
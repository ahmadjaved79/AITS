import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import api from '../../api';

export default function CandidateDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState(null);
  const [validation, setValidation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [blind, setBlind] = useState(false);
  const [expandedQuestion, setExpandedQuestion] = useState(null);

  useEffect(() => {
    api.get(`/candidate/${id}`)
      .then(({ data }) => {
        setCandidate(data.candidate);
        setValidation(data.validation);
      })
      .catch(err => {
        console.error('Failed to load candidate:', err);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-xl opacity-20 animate-pulse" />
          <div className="relative w-16 h-16 border-4 border-slate-700 border-t-blue-500 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
        <div className="text-center animate-in fade-in duration-500">
          <div className="text-8xl mb-6">🔍</div>
          <p className="text-slate-300 font-medium text-lg mb-8">Candidate not found</p>
          <button 
            onClick={() => navigate(-1)} 
            className="group inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:shadow-lg hover:shadow-blue-500/50 transition duration-300 transform hover:scale-105"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition" />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const scoreColor = (s) => {
    if (s >= 70) return 'text-emerald-400';
    if (s >= 40) return 'text-amber-400';
    return 'text-red-400';
  };

  const scoreBgColor = (s) => {
    if (s >= 70) return 'from-emerald-500/20 to-emerald-600/10 border-emerald-400/30';
    if (s >= 40) return 'from-amber-500/20 to-amber-600/10 border-amber-400/30';
    return 'from-red-500/20 to-red-600/10 border-red-400/30';
  };

  const ScoreBar = ({ label, value, color, icon }) => (
    <div className="animate-in fade-in slide-in-from-left duration-700">
      <div className="flex items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">{icon}</span>
          <span className="text-sm text-slate-300 font-medium">{label}</span>
        </div>
        <span className={`font-bold text-lg ${scoreColor(value)}`}>{value ?? 0}%</span>
      </div>
      <div className="w-full bg-slate-700/30 backdrop-blur-md rounded-full h-3 overflow-hidden border border-slate-600/50">
        <div 
          className={`h-full rounded-full transition-all duration-1000 bg-gradient-to-r ${color}`} 
          style={{ width: `${value ?? 0}%` }} 
        />
      </div>
    </div>
  );

  const finalScore = candidate.finalScore ?? 0;
  const scoreStatus = finalScore >= 70 ? 'Excellent' : finalScore >= 40 ? 'Moderate' : 'Needs Review';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Animated background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" 
          style={{ animation: 'float 8s ease-in-out infinite' }} />
        <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" 
          style={{ animation: 'float 10s ease-in-out infinite 2s' }} />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 animate-in fade-in slide-in-from-top duration-500">
          <button 
            onClick={() => navigate(-1)} 
            className="group flex items-center gap-2 text-slate-400 hover:text-slate-200 transition duration-300"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition" />
            <span className="text-sm font-medium">Back to Candidates</span>
          </button>

          {/* Blind Mode Toggle */}
          <label className="flex items-center gap-3 cursor-pointer select-none group">
            <span className="text-sm text-slate-400 group-hover:text-slate-300 transition">
              {blind ? <EyeOff className="w-4 h-4 inline mr-1" /> : <Eye className="w-4 h-4 inline mr-1" />}
              Blind Mode
            </span>
            <div
              onClick={() => setBlind(!blind)}
              className={`relative w-12 h-7 rounded-full transition-all duration-300 ${
                blind 
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg shadow-blue-500/50' 
                  : 'bg-slate-700 border border-slate-600'
              }`}
            >
              <div
                className="absolute top-1 w-5 h-5 bg-white rounded-full shadow-lg transition-all duration-300 transform"
                style={{ left: blind ? '22px' : '3px' }}
              />
            </div>
          </label>
        </div>

        {/* Candidate Identity Card */}
        <div className="group relative mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-xl opacity-0 group-hover:opacity-20 transition duration-500" />
          <div className="relative bg-gradient-to-br from-slate-800/60 to-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-7 group-hover:border-slate-600 transition duration-300">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-lg opacity-40 group-hover:opacity-60 transition duration-300" />
                <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-xl">
                  {blind ? '?' : candidate.name?.[0]?.toUpperCase()}
                </div>
              </div>

              {/* Info */}
              <div className="flex-1">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text text-transparent mb-1">
                  {blind ? '██████ ██████' : candidate.name}
                </h1>
                <p className="text-slate-400 text-sm font-mono mb-2">
                  {blind ? '████████@████.com' : candidate.email}
                </p>
                {candidate.jobId?.title && (
                  <div className="inline-block px-3 py-1 rounded-lg bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-400/30 text-xs font-semibold text-blue-300">
                    Applied for: {candidate.jobId.title}
                  </div>
                )}
              </div>

              {/* Score Status Badge */}
              <div className={`px-6 py-4 rounded-xl bg-gradient-to-br ${scoreBgColor(finalScore)} border backdrop-blur-md text-center`}>
                <p className="text-xs text-slate-400 mb-1">Overall Score</p>
                <p className={`text-4xl font-bold ${scoreColor(finalScore)}`}>{finalScore}</p>
                <p className="text-xs text-slate-400 mt-1">{scoreStatus}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Score Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          {[
            { label: 'Semantic Score', value: candidate.semanticScore, icon: '🧠', color: 'from-blue-500 to-cyan-500' },
            { label: 'Validation Score', value: candidate.validationScore, icon: '🧪', color: 'from-purple-500 to-pink-500' },
            { label: 'Final Score', value: candidate.finalScore, icon: '🏆', color: 'from-emerald-500 to-teal-500' },
          ].map(({ label, value, icon, color }, idx) => (
            <div 
              key={label} 
              className="group relative overflow-hidden rounded-2xl animate-in fade-in slide-in-from-bottom-4 duration-700"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-10 transition duration-500`} />
              <div className={`relative bg-gradient-to-br ${color} opacity-5 group-hover:opacity-15 border border-slate-700/50 group-hover:border-slate-600 backdrop-blur-xl rounded-2xl p-6 transition duration-300 transform group-hover:scale-105`}>
                <div className="text-4xl mb-3 transform group-hover:scale-125 transition duration-300">{icon}</div>
                <p className="text-3xl font-bold text-white mb-1">{value ?? 0}</p>
                <p className="text-xs text-slate-400">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Score Breakdown and AI Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Score Breakdown */}
          <div className="group relative overflow-hidden rounded-2xl animate-in fade-in slide-in-from-left-4 duration-700 delay-300">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-xl opacity-0 group-hover:opacity-20 transition duration-500" />
            <div className="relative bg-gradient-to-br from-slate-800/60 to-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-7 group-hover:border-slate-600 transition duration-300">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <span>📊</span> Score Breakdown
              </h3>
              <div className="space-y-5">
                <ScoreBar 
                  label="Semantic Match" 
                  value={candidate.semanticScore} 
                  color="from-blue-500 to-cyan-500"
                  icon="🧠"
                />
                <ScoreBar 
                  label="Validation Test" 
                  value={candidate.validationScore} 
                  color="from-purple-500 to-pink-500"
                  icon="🧪"
                />
                <ScoreBar 
                  label="Final Score" 
                  value={candidate.finalScore} 
                  color="from-emerald-500 to-teal-500"
                  icon="🏆"
                />
              </div>
            </div>
          </div>

          {/* AI Summary */}
          <div className="group relative overflow-hidden rounded-2xl animate-in fade-in slide-in-from-right-4 duration-700 delay-300">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur-xl opacity-0 group-hover:opacity-20 transition duration-500" />
            <div className="relative bg-gradient-to-br from-slate-800/60 to-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-7 group-hover:border-slate-600 transition duration-300">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <span>✨</span> AI Summary
              </h3>
              <p className="text-slate-300 leading-relaxed text-sm">
                {candidate.summary || 'No AI summary available for this candidate.'}
              </p>
              <div className="mt-4 pt-4 border-t border-slate-700/50">
                <p className="text-xs text-slate-400">🤖 Generated by AI Analysis Engine</p>
              </div>
            </div>
          </div>
        </div>

        {/* Skills Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Extracted Skills */}
          <div className="group relative overflow-hidden rounded-2xl animate-in fade-in slide-in-from-left-4 duration-700 delay-500">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl blur-xl opacity-0 group-hover:opacity-20 transition duration-500" />
            <div className="relative bg-gradient-to-br from-slate-800/60 to-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-7 group-hover:border-slate-600 transition duration-300">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-400" /> Extracted Skills
              </h3>
              {candidate.extractedSkills?.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {candidate.extractedSkills.map((s, i) => (
                    <span 
                      key={s} 
                      className="px-3 py-1.5 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 rounded-lg text-xs font-semibold border border-emerald-400/30 backdrop-blur-md hover:from-emerald-500/40 hover:to-teal-500/40 transition"
                      style={{ animation: `fade-in 0.5s ease-out ${i * 0.1}s both` }}
                    >
                      ✓ {s}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 text-sm">No skills extracted.</p>
              )}
            </div>
          </div>

          {/* Missing Skills */}
          <div className="group relative overflow-hidden rounded-2xl animate-in fade-in slide-in-from-right-4 duration-700 delay-500">
            <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-orange-600 rounded-2xl blur-xl opacity-0 group-hover:opacity-20 transition duration-500" />
            <div className="relative bg-gradient-to-br from-slate-800/60 to-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-7 group-hover:border-slate-600 transition duration-300">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-400" /> Missing Skills
              </h3>
              {candidate.missingSkills?.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {candidate.missingSkills.map((s, i) => (
                    <span 
                      key={s} 
                      className="px-3 py-1.5 bg-gradient-to-r from-red-500/20 to-orange-500/20 text-red-300 rounded-lg text-xs font-semibold border border-red-400/30 backdrop-blur-md hover:from-red-500/40 hover:to-orange-500/40 transition"
                      style={{ animation: `fade-in 0.5s ease-out ${i * 0.1}s both` }}
                    >
                      ✗ {s}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-2 text-emerald-300 text-sm font-medium">
                  <CheckCircle className="w-5 h-5" /> All required skills present!
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Validation Questions */}
        {validation?.completed && (
          <div className="group relative overflow-hidden rounded-2xl animate-in fade-in slide-in-from-bottom-4 duration-700 delay-700">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-2xl blur-xl opacity-0 group-hover:opacity-20 transition duration-500" />
            <div className="relative bg-gradient-to-br from-slate-800/60 to-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-7 group-hover:border-slate-600 transition duration-300">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>🧪</span> Validation Test Results
                </h3>
                <div className={`px-4 py-2 rounded-lg font-bold text-sm ${scoreColor(validation.score)} bg-slate-700/50 border border-slate-600/50`}>
                  {validation.score}%
                </div>
              </div>

              <p className="text-slate-400 text-sm mb-6">
                {validation.answers?.length} questions answered
              </p>

              <div className="space-y-3">
                {validation.questions?.map((q, i) => {
                  const isExpanded = expandedQuestion === i;
                  return (
                    <div 
                      key={i}
                      className="animate-in fade-in duration-500"
                      style={{ animationDelay: `${i * 100}ms` }}
                    >
                      <button
                        onClick={() => setExpandedQuestion(isExpanded ? null : i)}
                        className="w-full text-left p-4 rounded-xl bg-slate-700/30 border border-slate-600/50 hover:bg-slate-700/50 hover:border-slate-600 transition duration-300 flex items-start justify-between gap-3 group/question"
                      >
                        <div>
                          <p className="text-sm font-semibold text-white mb-1">
                            {i + 1}. {q.question}
                          </p>
                          <p className="text-xs text-slate-400">
                            {validation.answers?.[i] === q.correctIndex ? (
                              <span className="text-emerald-400">✓ Correct</span>
                            ) : (
                              <span className="text-red-400">✗ Incorrect</span>
                            )}
                          </p>
                        </div>
                        <span className="text-slate-400 group-hover/question:text-slate-300 transition text-lg flex-shrink-0">
                          {isExpanded ? '−' : '+'}
                        </span>
                      </button>

                      {isExpanded && (
                        <div className="mt-2 p-4 rounded-xl bg-slate-700/20 border border-slate-600/50 space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                          {q.options?.map((opt, oi) => {
                            const isCorrect = oi === q.correctIndex;
                            const isChosen = oi === validation.answers?.[i];
                            return (
                              <div 
                                key={oi} 
                                className={`text-xs px-4 py-2.5 rounded-lg flex items-center gap-3 font-medium transition ${
                                  isCorrect 
                                    ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 border border-emerald-400/30' 
                                    : isChosen 
                                    ? 'bg-gradient-to-r from-red-500/20 to-orange-500/20 text-red-300 border border-red-400/30' 
                                    : 'text-slate-400 bg-slate-700/20 border border-slate-600/30'
                                }`}
                              >
                                <span>
                                  {isCorrect ? '✓' : isChosen ? '✗' : '○'}
                                </span>
                                {opt}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
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
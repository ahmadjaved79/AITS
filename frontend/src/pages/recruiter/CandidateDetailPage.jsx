import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api';

export default function CandidateDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState(null);
  const [validation, setValidation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [blind, setBlind] = useState(false);

  useEffect(() => {
    // ✅ Fixed API path — matches the new /detail/:id route
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

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full" />
    </div>
  );

  if (!candidate) return (
    <div className="text-center py-16">
      <div className="text-4xl mb-3">🔍</div>
      <p className="text-gray-500 font-medium">Candidate not found.</p>
      <button onClick={() => navigate(-1)} className="mt-4 text-blue-600 hover:underline text-sm">← Go Back</button>
    </div>
  );

  const scoreColor = (s) =>
    s >= 70 ? 'text-green-600' : s >= 40 ? 'text-yellow-500' : 'text-red-500';

  const ScoreBar = ({ label, value, color }) => (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-600">{label}</span>
        <span className={`font-semibold ${scoreColor(value)}`}>{value ?? 0}%</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2.5">
        <div className={`h-2.5 rounded-full transition-all duration-700 ${color}`} style={{ width: `${value ?? 0}%` }} />
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-gray-600 text-sm flex items-center gap-1">
          ← Back to Candidates
        </button>
        {/* Blind Mode Toggle */}
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <span className="text-sm text-gray-600">Blind Mode</span>
          <div
            onClick={() => setBlind(!blind)}
            className={`w-11 h-6 rounded-full relative transition-colors duration-200 ${blind ? 'bg-blue-600' : 'bg-gray-300'}`}
          >
            <div
              className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-200"
              style={{ left: blind ? '22px' : '2px' }}
            />
          </div>
        </label>
      </div>

      {/* Candidate Identity */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6 flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-2xl font-bold">
          {blind ? '?' : candidate.name?.[0]?.toUpperCase()}
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            {blind ? '██████ ██████' : candidate.name}
          </h1>
          <p className="text-gray-500 text-sm">
            {blind ? '████████@████.com' : candidate.email}
          </p>
          {candidate.jobId?.title && (
            <p className="text-blue-600 text-xs mt-1 font-medium">Applied for: {candidate.jobId.title}</p>
          )}
        </div>
      </div>

      {/* Score Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Semantic Score', value: candidate.semanticScore, icon: '🧠', bg: 'bg-blue-50', text: 'text-blue-700' },
          { label: 'Validation Score', value: candidate.validationScore, icon: '🧪', bg: 'bg-purple-50', text: 'text-purple-700' },
          { label: 'Final Score', value: candidate.finalScore, icon: '🏆', bg: 'bg-green-50', text: 'text-green-700' },
        ].map(({ label, value, icon, bg, text }) => (
          <div key={label} className={`${bg} rounded-2xl p-5 text-center`}>
            <div className="text-2xl mb-1">{icon}</div>
            <p className={`text-3xl font-bold ${text}`}>{value ?? 0}</p>
            <p className="text-xs text-gray-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Score Breakdown */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Score Breakdown</h3>
          <div className="space-y-4">
            <ScoreBar label="Semantic Match" value={candidate.semanticScore} color="bg-blue-500" />
            <ScoreBar label="Validation Test" value={candidate.validationScore} color="bg-purple-500" />
            <ScoreBar label="Final Score" value={candidate.finalScore} color="bg-green-500" />
          </div>
        </div>

        {/* AI Summary */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-800 mb-3">AI Summary</h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            {candidate.summary || 'No AI summary available for this candidate.'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Extracted Skills */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-800 mb-3">Extracted Skills</h3>
          {candidate.extractedSkills?.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {candidate.extractedSkills.map(s => (
                <span key={s} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">{s}</span>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">No skills extracted.</p>
          )}
        </div>

        {/* Missing Skills */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-800 mb-3">Missing Skills</h3>
          {candidate.missingSkills?.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {candidate.missingSkills.map(s => (
                <span key={s} className="px-3 py-1 bg-red-50 text-red-600 rounded-full text-sm font-medium">{s}</span>
              ))}
            </div>
          ) : (
            <p className="text-green-600 text-sm font-medium">✅ All required skills present!</p>
          )}
        </div>
      </div>

      {/* Validation Questions (if completed) */}
      {validation?.completed && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mt-6">
          <h3 className="font-semibold text-gray-800 mb-1">Validation Test Results</h3>
          <p className="text-sm text-gray-500 mb-4">
            Score: <span className={`font-bold ${scoreColor(validation.score)}`}>{validation.score}%</span>
            &nbsp;·&nbsp; {validation.answers?.length} questions answered
          </p>
          <div className="space-y-4">
            {validation.questions?.map((q, i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm font-medium text-gray-800 mb-2">{i + 1}. {q.question}</p>
                <div className="space-y-1">
                  {q.options?.map((opt, oi) => {
                    const isCorrect = oi === q.correctIndex;
                    const isChosen  = oi === validation.answers?.[i];
                    return (
                      <div key={oi} className={`text-xs px-3 py-1.5 rounded-lg flex items-center gap-2
                        ${isCorrect ? 'bg-green-100 text-green-700 font-medium' :
                          isChosen  ? 'bg-red-100 text-red-600' :
                                      'text-gray-500'}`}>
                        {isCorrect ? '✓' : isChosen ? '✗' : '○'} {opt}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
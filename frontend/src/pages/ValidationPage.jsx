import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api'; // adjust path if your axios instance is elsewhere

export default function ValidationPage() {
  const { validationId } = useParams();

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers]     = useState({});
  const [loading, setLoading]     = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult]       = useState(null); // { score, correct, total, finalScore }
  const [error, setError]         = useState('');
  const [alreadyDone, setAlreadyDone] = useState(false);

  // ── Load questions from sessionStorage (set by recruiter page) or fallback ──
  useEffect(() => {
    const cached = sessionStorage.getItem(`val_${validationId}`);
    if (cached) {
      try {
        setQuestions(JSON.parse(cached));
        setLoading(false);
        return;
      } catch { /* fall through to fetch */ }
    }
    setLoading(false);
    setError('Test link has expired or is invalid. Please contact the recruiter.');
  }, [validationId]);

  const handleSelect = (qIndex, optionIndex) => {
    setAnswers(prev => ({ ...prev, [qIndex]: optionIndex }));
  };

  const handleSubmit = async () => {
    // Validate all answered
    if (Object.keys(answers).length < questions.length) {
      setError('Please answer all questions before submitting.');
      return;
    }
    setError('');
    setSubmitting(true);

    // Convert answers object to array [ ans0, ans1, ans2, ... ]
    const answersArray = questions.map((_, i) => answers[i]);

    try {
      const { data } = await api.post('/validation/submit', {
        validationId,
        answers: answersArray,
      });
      setResult(data);
      // Clear cached questions after submission
      sessionStorage.removeItem(`val_${validationId}`);
    } catch (e) {
      const msg = e.response?.data?.error || e.message;
      if (msg === 'Already submitted') {
        setAlreadyDone(true);
      } else {
        setError(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  // ── States ────────────────────────────────────────────────────────────────

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin h-10 w-10 border-2 border-blue-600 border-t-transparent rounded-full" />
    </div>
  );

  if (alreadyDone) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full text-center">
        <div className="text-5xl mb-4">✅</div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Already Submitted</h2>
        <p className="text-gray-500 text-sm">You have already completed this test. Your score has been recorded.</p>
      </div>
    </div>
  );

  if (result) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-1">Test Complete!</h2>
        <p className="text-gray-500 text-sm mb-6">Your answers have been recorded</p>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-blue-50 rounded-xl p-4">
            <p className="text-3xl font-bold text-blue-600">{result.score}%</p>
            <p className="text-xs text-gray-500 mt-1">Validation Score</p>
          </div>
          <div className="bg-green-50 rounded-xl p-4">
            <p className="text-3xl font-bold text-green-600">{result.finalScore}</p>
            <p className="text-xs text-gray-500 mt-1">Final Score</p>
          </div>
        </div>

        <p className="text-gray-600 text-sm">
          You answered <span className="font-semibold text-blue-600">{result.correct}</span> out of{' '}
          <span className="font-semibold">{result.total}</span> questions correctly.
        </p>

        <div className="mt-6 bg-gray-50 rounded-xl p-4 text-sm text-gray-500">
          The recruiter has been notified of your results. You will be contacted if selected.
        </div>
      </div>
    </div>
  );

  if (error && questions.length === 0) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full text-center">
        <div className="text-5xl mb-4">⚠️</div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Invalid Test Link</h2>
        <p className="text-gray-500 text-sm">{error}</p>
      </div>
    </div>
  );

  // ── Question UI ───────────────────────────────────────────────────────────
  const progress = Math.round((Object.keys(answers).length / questions.length) * 100);

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-sm">
              AHIS
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Technical Validation Test</h1>
              <p className="text-xs text-gray-400">{questions.length} questions · Select the best answer for each</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-gray-100 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-xs text-gray-500 whitespace-nowrap">
              {Object.keys(answers).length}/{questions.length} answered
            </span>
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-4 mb-6">
          {questions.map((q, qi) => (
            <div
              key={qi}
              className={`bg-white rounded-2xl border p-6 transition-all ${
                answers[qi] !== undefined ? 'border-blue-200' : 'border-gray-100'
              }`}
            >
              {/* Question */}
              <p className="font-semibold text-gray-800 mb-4">
                <span className="text-blue-600 mr-2">Q{qi + 1}.</span>
                {q.question}
              </p>

              {/* Options */}
              <div className="space-y-2">
                {q.options.map((opt, oi) => (
                  <button
                    key={oi}
                    onClick={() => handleSelect(qi, oi)}
                    className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all ${
                      answers[qi] === oi
                        ? 'border-blue-600 bg-blue-50 text-blue-700 font-medium'
                        : 'border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50'
                    }`}
                  >
                    <span className={`inline-block w-6 h-6 rounded-full border text-xs font-bold mr-3 text-center leading-5 ${
                      answers[qi] === oi
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'border-gray-300 text-gray-400'
                    }`}>
                      {String.fromCharCode(65 + oi)}
                    </span>
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm mb-4">
            ⚠️ {error}
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={submitting || Object.keys(answers).length < questions.length}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl text-base transition-all"
        >
          {submitting ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
              </svg>
              Submitting...
            </span>
          ) : `Submit Test (${Object.keys(answers).length}/${questions.length} answered)`}
        </button>

      </div>
    </div>
  );
}
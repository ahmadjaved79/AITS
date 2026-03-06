import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';

export default function ValidationPage() {
  const { validationId } = useParams();
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  // NOTE: In production, recruiter sends candidate a direct link like:
  // /validation/{validationId}?q=<questions_json>
  // Here we fetch the questions from an open endpoint you can add,
  // OR pass them via state. For simplicity, show a form to paste validationId.

  useEffect(() => {
    // Try to load questions from sessionStorage (set after generation)
    const cached = sessionStorage.getItem(`val_${validationId}`);
    if (cached) setQuestions(JSON.parse(cached));
  }, [validationId]);

  const handleAnswer = (qi, opt) => setAnswers(prev => ({ ...prev, [qi]: opt }));

  const handleSubmit = async () => {
    if (Object.keys(answers).length < questions.length) {
      setErr('Please answer all questions before submitting.'); return;
    }
    setLoading(true); setErr('');
    try {
      const ansArr = questions.map((_, i) => answers[i] ?? -1);
      const { data } = await api.post('/validation/submit', { validationId, answers: ansArr });
      setResult(data);
    } catch (e) {
      setErr(e.response?.data?.error || 'Submission failed');
    } finally { setLoading(false); }
  };

  if (result) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${result.score >= 60 ? 'bg-green-100' : 'bg-yellow-100'}`}>
          <span className={`text-3xl ${result.score >= 60 ? 'text-green-500' : 'text-yellow-500'}`}>
            {result.score >= 60 ? '🎉' : '📝'}
          </span>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Test Completed!</h2>
        <div className="bg-gray-50 rounded-xl p-5 mb-6 space-y-2">
          <div className="text-3xl font-bold text-primary">{result.score}%</div>
          <p className="text-gray-500 text-sm">{result.correct} / {result.total} correct</p>
          <p className="text-sm text-gray-600">Final Score: <span className="font-semibold text-gray-900">{result.finalScore}</span></p>
        </div>
        <Link to="/" className="btn-primary inline-block">Done</Link>
      </div>
    </div>
  );

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-gray-500">Loading your test...</p>
      </div>
    </div>
  );

  if (err) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
        <div className="text-5xl mb-4">⚠️</div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Test Unavailable</h2>
        <p className="text-gray-500 text-sm mb-4">{err}</p>
        <Link to="/" className="btn-primary inline-block">Back to Jobs</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="card mb-6">
          <h1 className="text-xl font-bold text-gray-900">Technical Validation Test</h1>
          <p className="text-gray-500 text-sm mt-1">Answer all {questions.length} questions to complete your assessment.</p>
        </div>
        {err && <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg p-3 mb-4">{err}</div>}
        <div className="space-y-4">
          {questions.map((q, qi) => (
            <div key={qi} className="card">
              <p className="font-medium text-gray-900 mb-3">Q{qi + 1}. {q.question}</p>
              <div className="space-y-2">
                {q.options.map((opt, oi) => (
                  <button key={oi} onClick={() => handleAnswer(qi, oi)}
                    className={`w-full text-left px-4 py-3 rounded-lg border text-sm transition ${
                      answers[qi] === oi
                        ? 'border-primary bg-primary-50 text-primary font-medium'
                        : 'border-gray-200 hover:border-primary hover:bg-primary-50'
                    }`}>
                    <span className="font-medium mr-2">{['A', 'B', 'C', 'D'][oi]}.</span> {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 flex justify-between items-center">
          <span className="text-sm text-gray-500">{Object.keys(answers).length}/{questions.length} answered</span>
          <button onClick={handleSubmit} disabled={loading}
            className="btn-primary px-8 py-3 disabled:opacity-50">
            {loading ? 'Submitting...' : 'Submit Test'}
          </button>
        </div>
      </div>
    </div>
  );
}
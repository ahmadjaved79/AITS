import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api';

export default function CandidatesPage() {
  const { jobId } = useParams();
  const [candidates, setCandidates] = useState([]);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [genLoading, setGenLoading] = useState(null);

  // Modal state
  const [modal, setModal] = useState(null); // { link, validationId }
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get(`/candidates/${jobId}`),
      api.get(`/jobs/${jobId}`),
    ]).then(([cr, jr]) => {
      setCandidates(cr.data);
      setJob(jr.data);
    }).catch(console.error).finally(() => setLoading(false));
  }, [jobId]);

  const generateTest = async (candidateId) => {
    setGenLoading(candidateId);
    try {
      const { data } = await api.post(`/validation/generate/${candidateId}`);
      // Store questions so candidate page can load them
      sessionStorage.setItem(`val_${data.validationId}`, JSON.stringify(data.questions));
      const link = `${window.location.origin}/validation/${data.validationId}`;
      setModal({ link, validationId: data.validationId });
      setCopied(false);
      // Refresh candidates list
      const cr = await api.get(`/candidates/${jobId}`);
      setCandidates(cr.data);
    } catch (e) {
      alert(e.response?.data?.error || 'Failed to generate test');
    } finally {
      setGenLoading(null);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(modal.link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const scoreColor = (s) =>
    s >= 70 ? 'text-green-600' : s >= 40 ? 'text-yellow-600' : 'text-red-500';

  return (
    <div>
      {/* ── Link Modal ── */}
      {modal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-xl">✅</div>
                <div>
                  <h3 className="font-bold text-gray-900">Test Generated!</h3>
                  <p className="text-xs text-gray-400">Share this link with the candidate</p>
                </div>
              </div>
              <button onClick={() => setModal(null)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
            </div>

            {/* Link box */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4">
              <p className="text-xs text-gray-500 mb-2 font-medium">VALIDATION TEST LINK</p>
              <div className="flex items-center gap-2">
                <input
                  readOnly
                  value={modal.link}
                  className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 select-all"
                  onFocus={e => e.target.select()}
                />
                <button
                  onClick={handleCopy}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${
                    copied
                      ? 'bg-green-500 text-white'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}>
                  {copied ? '✓ Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            {/* Direct open button */}
            <div className="flex gap-3">
              <a
                href={modal.link}
                target="_blank"
                rel="noreferrer"
                className="flex-1 text-center border border-blue-600 text-blue-600 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-50 transition">
                Open in New Tab ↗
              </a>
              <button
                onClick={() => setModal(null)}
                className="flex-1 bg-gray-100 text-gray-600 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-200 transition">
                Close
              </button>
            </div>

            <p className="text-xs text-gray-400 text-center mt-3">
              💡 Tip: Send this link to the candidate via email or WhatsApp
            </p>
          </div>
        </div>
      )}

      {/* ── Page Header ── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Candidates</h1>
          {job && (
            <p className="text-gray-500 text-sm mt-1">
              {job.title} — {candidates.length} applicant{candidates.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        <Link to={`/recruiter/analytics/${jobId}`} className="border border-blue-600 text-blue-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-50 transition">
          📊 Analytics
        </Link>
      </div>

      {/* ── Table ── */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading candidates...</div>
      ) : candidates.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <div className="text-4xl mb-3">📭</div>
          <p className="text-gray-500">No applications yet for this role.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Rank</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Name</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Email</th>
                <th className="text-right py-3 px-4 text-gray-500 font-medium">Semantic</th>
                <th className="text-right py-3 px-4 text-gray-500 font-medium">Validation</th>
                <th className="text-right py-3 px-4 text-gray-500 font-medium">Final</th>
                <th className="text-center py-3 px-4 text-gray-500 font-medium">Status</th>
                <th className="text-right py-3 px-4 text-gray-500 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {candidates.map((c, i) => (
                <tr key={c._id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                  <td className="py-3 px-4">
                    <span className={`font-bold text-base ${
                      i === 0 ? 'text-yellow-500' :
                      i === 1 ? 'text-gray-400' :
                      i === 2 ? 'text-orange-400' : 'text-gray-400'
                    }`}>
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-medium text-gray-900">{c.name}</td>
                  <td className="py-3 px-4 text-gray-500">{c.email}</td>
                  <td className={`py-3 px-4 text-right font-semibold ${scoreColor(c.semanticScore)}`}>{c.semanticScore}</td>
                  <td className={`py-3 px-4 text-right font-semibold ${scoreColor(c.validationScore)}`}>{c.validationScore}</td>
                  <td className={`py-3 px-4 text-right font-bold text-base ${scoreColor(c.finalScore)}`}>{c.finalScore}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      c.status === 'validated' ? 'bg-green-100 text-green-600' :
                      c.status === 'invited'   ? 'bg-blue-100 text-blue-600' :
                      c.status === 'processed' ? 'bg-purple-100 text-purple-600' :
                                                 'bg-gray-100 text-gray-500'
                    }`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2 justify-end">
                      <Link
                        to={`/recruiter/candidate/${c._id}`}
                        className="text-blue-600 text-xs font-medium hover:underline">
                        View
                      </Link>
                      {c.status === 'processed' && (
                        <button
                          onClick={() => generateTest(c._id)}
                          disabled={genLoading === c._id}
                          className="text-purple-600 text-xs font-medium hover:underline disabled:opacity-40">
                          {genLoading === c._id ? '⏳ ...' : '🧪 Gen Test'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
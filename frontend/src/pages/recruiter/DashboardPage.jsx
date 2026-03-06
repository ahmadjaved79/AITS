import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';
import { useAuth } from '../../context/AuthContext';

export default function DashboardPage() {
  const [jobs, setJobs]       = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    api.get('/jobs')
      .then(r => setJobs(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const avatarColors = [
    'from-blue-500 to-blue-700',
    'from-purple-500 to-purple-700',
    'from-green-500 to-green-700',
    'from-orange-500 to-orange-700',
    'from-pink-500 to-pink-700',
  ];

  const statCards = [
    {
      label: 'Active Jobs',
      value: jobs.length,
      sub: 'Open positions',
      icon: '💼',
      from: 'from-blue-500',
      to: 'to-blue-700',
    },
    {
      label: 'AI Screening',
      value: 'ON',
      sub: 'NLP-based candidate evaluation',
      icon: '🤖',
      from: 'from-green-500',
      to: 'to-green-700',
    },
    {
      label: 'Bias Mode',
      value: '0%',
      sub: 'Blind mode available',
      icon: '🛡️',
      from: 'from-orange-500',
      to: 'to-orange-700',
    },
    {
      label: 'Auto Rank',
      value: 'Live',
      sub: 'Real-time scoring',
      icon: '⚡',
      from: 'from-purple-500',
      to: 'to-purple-700',
    },
  ];

  return (
    <div className="p-6 space-y-6">

      {/* ── Hero ── */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Welcome back, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-blue-100 text-sm mt-1">
            Your AI hiring pipeline is active. Review candidates and manage job postings.
          </p>
        </div>
        <Link
          to="/recruiter/create-job"
          className="bg-white text-blue-700 font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-blue-50 transition-all shadow"
        >
          + New Job Posting
        </Link>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <div
            key={s.label}
            className={`bg-gradient-to-br ${s.from} ${s.to} rounded-2xl p-5 text-white shadow-lg relative overflow-hidden`}
          >
            <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-white opacity-10" />
            <div className="text-3xl mb-2">{s.icon}</div>
            <div className="text-3xl font-bold leading-none">{s.value}</div>
            <div className="text-sm font-semibold mt-1">{s.label}</div>
            <div className="text-xs opacity-75 mt-0.5">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* ── Job Postings ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

        {/* Table Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-800">📋 Job Postings</h2>
          <Link
            to="/recruiter/create-job"
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-all"
          >
            + Create Job
          </Link>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full mb-3" />
            <p className="text-sm">Loading jobs...</p>
          </div>
        )}

        {/* Empty */}
        {!loading && jobs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <div className="text-5xl mb-4">📂</div>
            <p className="text-sm font-medium mb-4">No job postings yet.</p>
            <Link
              to="/recruiter/create-job"
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all"
            >
              Create Your First Job
            </Link>
          </div>
        )}

        {/* Table */}
        {!loading && jobs.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">#</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Job Title</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Skills</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Weights</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Created</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {jobs.map((job, i) => (
                  <tr key={job._id} className="hover:bg-blue-50 transition-colors">

                    {/* Index */}
                    <td className="px-6 py-4">
                      <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${avatarColors[i % avatarColors.length]} text-white text-xs font-bold flex items-center justify-center`}>
                        {i + 1}
                      </div>
                    </td>

                    {/* Title */}
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-900">{job.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5 max-w-xs truncate">{job.description}</p>
                    </td>

                    {/* Skills */}
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {job.requiredSkills?.slice(0, 3).map(s => (
                          <span key={s} className="bg-blue-50 text-blue-700 text-xs font-medium px-2 py-0.5 rounded-full">
                            {s}
                          </span>
                        ))}
                        {job.requiredSkills?.length > 3 && (
                          <span className="bg-gray-100 text-gray-500 text-xs font-medium px-2 py-0.5 rounded-full">
                            +{job.requiredSkills.length - 3}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Weights */}
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                          S {Math.round((job.weights?.semantic || 0.6) * 100)}%
                        </span>
                        <span className="bg-purple-100 text-purple-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                          V {Math.round((job.weights?.validation || 0.4) * 100)}%
                        </span>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4 text-xs text-gray-400 whitespace-nowrap">
                      {new Date(job.createdAt).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric'
                      })}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <Link
                          to={`/recruiter/candidates/${job._id}`}
                          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
                        >
                          👥 Candidates
                        </Link>
                        <Link
                          to={`/recruiter/analytics/${job._id}`}
                          className="bg-purple-100 hover:bg-purple-200 text-purple-700 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
                        >
                          📊 Analytics
                        </Link>
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── AI Tip ── */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-start gap-3">
        <span className="text-2xl">💡</span>
        <div>
          <p className="text-sm font-semibold text-blue-800">Pro Tip</p>
          <p className="text-sm text-blue-700 mt-0.5">
            Use <strong>Blind Mode</strong> on the candidate detail page to hide names and emails — ensures fair, bias-free evaluation based purely on skills and scores.
          </p>
        </div>
      </div>

    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';

export default function JobListPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/jobs').then(r => setJobs(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const filtered = jobs.filter(j =>
    j.title.toLowerCase().includes(search.toLowerCase()) ||
    j.requiredSkills?.some(s => s.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div>
      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-3">Find Your Next Role</h1>
          <p className="text-blue-100 text-lg mb-8">
            AI-powered screening gives you instant feedback on your application.
          </p>
          <div className="relative max-w-xl mx-auto">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            <input
              className="w-full pl-10 pr-4 py-3 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm"
              placeholder="Search by title or skill (e.g. React, Python)..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-6 text-sm text-gray-500">
          <span>🤖 AI-Powered Screening</span>
          <span>⚡ Instant Score Feedback</span>
          <span>🎯 Bias-Free Evaluation</span>
          <span className="ml-auto font-medium text-gray-700">{jobs.length} open positions</span>
        </div>
      </div>

      {/* Job listings */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        {loading ? (
          <div className="space-y-4">
            {[1,2,3].map(i => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 p-6 animate-pulse">
                <div className="h-5 bg-gray-200 rounded w-1/3 mb-3" />
                <div className="h-3 bg-gray-100 rounded w-2/3 mb-2" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-lg font-semibold text-gray-700">No jobs found</h3>
            <p className="text-gray-400 text-sm mt-1">Try a different search term</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(job => (
              <div key={job._id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 hover:shadow-md hover:border-blue-200 transition group">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    {/* Job icon + title */}
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 font-bold text-sm flex-shrink-0">
                        {job.title[0]}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition">{job.title}</h3>
                        <p className="text-xs text-gray-400">Posted {new Date(job.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                      </div>
                    </div>

                    <p className="text-gray-500 text-sm mb-4 line-clamp-2">{job.description}</p>

                    {/* Skills */}
                    {job.requiredSkills?.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {job.requiredSkills.map(s => (
                          <span key={s} className="bg-blue-50 text-blue-600 text-xs px-3 py-1 rounded-full font-medium">{s}</span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* CTA */}
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <Link to={`/apply/${job._id}`}
                      className="bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition whitespace-nowrap">
                      Apply Now →
                    </Link>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      🤖 AI Screened
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
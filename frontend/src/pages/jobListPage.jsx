import React2, { useState as useState2, useEffect as useEffect2 } from 'react';
import { Link } from 'react-router-dom';
import api2 from '../api';

export function JobListPage() {
  const [jobs, setJobs] = useState2([]);
  const [loading, setLoading] = useState2(true);

  useEffect2(() => {
    api2.get('/jobs').then(r => setJobs(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-sm">A</div>
          <span className="font-bold text-gray-900">AHIS Job Board</span>
        </div>
        <Link to="/login" className="btn-outline text-sm">Recruiter Login</Link>
      </header>
      <main className="max-w-4xl mx-auto p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Open Positions</h2>
        <p className="text-gray-500 mb-6">AI-powered screening. Apply with your resume and get instant feedback.</p>
        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading jobs...</div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-12 text-gray-400">No open positions currently.</div>
        ) : (
          <div className="space-y-4">
            {jobs.map(job => (
              <div key={job._id} className="card hover:shadow-md transition">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                    <p className="text-gray-500 text-sm mt-1 line-clamp-2">{job.description}</p>
                    {job.requiredSkills?.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {job.requiredSkills.slice(0, 6).map(s => (
                          <span key={s} className="bg-primary-light text-primary text-xs px-2 py-1 rounded-full">{s}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <Link to={`/apply/${job._id}`} className="btn-primary text-sm ml-4 whitespace-nowrap">Apply Now</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
export default JobListPage;

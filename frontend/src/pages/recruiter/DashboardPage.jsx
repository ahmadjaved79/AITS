import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';
import { useAuth } from '../../context/AuthContext';

export function DashboardPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    api.get('/jobs').then(r => setJobs(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name} 👋</h1>
        <p className="text-gray-500 mt-1">Manage your job postings and review AI-screened candidates.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="card text-center">
          <div className="text-3xl font-bold text-primary">{jobs.length}</div>
          <div className="text-sm text-gray-500 mt-1">Active Jobs</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-green-500">AI</div>
          <div className="text-sm text-gray-500 mt-1">Powered Screening</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-purple-500">0%</div>
          <div className="text-sm text-gray-500 mt-1">Bias Mode Off</div>
        </div>
      </div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Job Postings</h2>
        <Link to="/recruiter/create-job" className="btn-primary text-sm">+ Create Job</Link>
      </div>
      {loading ? <div className="text-center py-8 text-gray-400">Loading...</div> :
       jobs.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-400">No jobs yet. Create your first posting!</p>
          <Link to="/recruiter/create-job" className="btn-primary inline-block mt-4 text-sm">Create Job</Link>
        </div>
       ) : (
        <div className="space-y-3">
          {jobs.map(job => (
            <div key={job._id} className="card flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">{job.title}</h3>
                <p className="text-xs text-gray-400 mt-0.5">{new Date(job.createdAt).toLocaleDateString()}</p>
                <div className="flex gap-1 mt-2 flex-wrap">
                  {job.requiredSkills?.slice(0, 4).map(s => (
                    <span key={s} className="text-xs bg-primary-light text-primary px-2 py-0.5 rounded-full">{s}</span>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 ml-4">
                <Link to={`/recruiter/candidates/${job._id}`} className="btn-outline text-xs">Candidates</Link>
                <Link to={`/recruiter/analytics/${job._id}`} className="btn-primary text-xs">Analytics</Link>
              </div>
            </div>
          ))}
        </div>
       )}
    </div>
  );
}
export default DashboardPage;

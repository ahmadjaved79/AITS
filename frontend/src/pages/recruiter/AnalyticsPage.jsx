import React2, { useState as useState2, useEffect as useEffect2 } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS2, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import api2 from '../../api';

ChartJS2.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export function AnalyticsPage() {
  const { jobId } = useParams();
  const [data, setData] = useState2(null);
  const [job, setJob] = useState2(null);
  const [loading, setLoading] = useState2(true);

  useEffect2(() => {
    Promise.all([api2.get(`/analytics/${jobId}`), api2.get(`/jobs/${jobId}`)])
      .then(([ar, jr]) => { setData(ar.data); setJob(jr.data); })
      .catch(console.error).finally(() => setLoading(false));
  }, [jobId]);

  if (loading) return <div className="text-center py-12 text-gray-400">Loading analytics...</div>;
  if (!data) return <div className="text-center py-12 text-red-400">No data found.</div>;

  const topChart = {
    labels: data.topCandidates.map(c => c.name.split(' ')[0]),
    datasets: [
      { label: 'Semantic', data: data.topCandidates.map(c => c.semanticScore), backgroundColor: '#93c5fd' },
      { label: 'Final Score', data: data.topCandidates.map(c => c.finalScore), backgroundColor: '#2563EB' },
    ],
  };

  const skillChart = {
    labels: data.skillDistribution.map(s => s.skill),
    datasets: [{
      label: 'Candidates with skill',
      data: data.skillDistribution.map(s => s.count),
      backgroundColor: '#7c3aed',
    }],
  };

  const chartOpts = { responsive: true, plugins: { legend: { position: 'top' } } };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          {job && <p className="text-gray-500 text-sm">{job.title}</p>}
        </div>
        <Link to={`/recruiter/candidates/${jobId}`} className="btn-outline text-sm">← Candidates</Link>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="card text-center">
          <div className="text-3xl font-bold text-primary">{data.metrics.total}</div>
          <div className="text-xs text-gray-500 mt-1">Total Applicants</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-green-500">{data.metrics.avgSemantic}</div>
          <div className="text-xs text-gray-500 mt-1">Avg Semantic Score</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-purple-500">{data.metrics.avgFinal}</div>
          <div className="text-xs text-gray-500 mt-1">Avg Final Score</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">Top Candidates</h3>
          {data.topCandidates.length > 0
            ? <Bar data={topChart} options={chartOpts} />
            : <p className="text-gray-400 text-sm">No data yet</p>}
        </div>
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">Skill Distribution</h3>
          {data.skillDistribution.length > 0
            ? <Bar data={skillChart} options={chartOpts} />
            : <p className="text-gray-400 text-sm">No data yet</p>}
        </div>
      </div>
    </div>
  );
}
export default AnalyticsPage;

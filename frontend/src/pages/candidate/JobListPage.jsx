import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Briefcase, Zap, Target, ArrowRight } from 'lucide-react';
import api from '../../api';

export default function JobListPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [hoveredJobId, setHoveredJobId] = useState(null);
  const [visibleJobs, setVisibleJobs] = useState(6);

  useEffect(() => {
    api.get('/jobs')
      .then(r => setJobs(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = jobs.filter(j =>
    j.title.toLowerCase().includes(search.toLowerCase()) ||
    j.requiredSkills?.some(s => s.toLowerCase().includes(search.toLowerCase()))
  );

  // Professional company logos (customize with real logos)
  const companyLogos = [
    { name: 'TechCorp', emoji: '🚀', color: 'from-blue-600 to-blue-400' },
    { name: 'DataFlow', emoji: '📊', color: 'from-purple-600 to-pink-400' },
    { name: 'CloudSync', emoji: '☁️', color: 'from-cyan-500 to-blue-400' },
    { name: 'AI Labs', emoji: '🤖', color: 'from-orange-500 to-red-400' },
    { name: 'DevHub', emoji: '⚙️', color: 'from-green-600 to-emerald-400' },
    { name: 'SecureNet', emoji: '🔐', color: 'from-indigo-600 to-purple-400' },
  ];

  const features = [
    { icon: '🤖', label: 'AI-Powered Screening', desc: 'Intelligent resume analysis' },
    { icon: '⚡', label: 'Instant Feedback', desc: 'Real-time score results' },
    { icon: '🎯', label: 'Bias-Free', desc: 'Fair candidate evaluation' },
  ];

  const getCompanyLogo = (jobIndex) => {
    return companyLogos[jobIndex % companyLogos.length];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Animated background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" 
          style={{ animation: 'float 8s ease-in-out infinite' }} />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" 
          style={{ animation: 'float 10s ease-in-out infinite 2s' }} />
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" 
          style={{ animation: 'float 12s ease-in-out infinite 4s' }} />
      </div>

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Animated headline */}
          <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="inline-block mb-6">
              <span className="px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-400/30 text-sm font-semibold text-blue-300 backdrop-blur-md">
                ✨ AI-Powered Job Marketplace
              </span>
            </div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Find Your Perfect Role
              </span>
            </h1>
            
            <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-8 leading-relaxed">
              Get instant AI feedback on every application. Land your dream job with confidence.
            </p>

            {/* Search Box with gradient */}
            <div className="relative max-w-2xl mx-auto mb-8 group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500" />
              <div className="relative bg-slate-800/80 backdrop-blur-xl rounded-2xl p-1 border border-slate-700/50">
                <div className="flex items-center px-6 py-4 gap-3">
                  <span className="text-xl text-slate-400">🔍</span>
                  <input
                    type="text"
                    placeholder="Search by job title or skill (React, Python, AWS...)"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="flex-1 bg-transparent outline-none text-white placeholder-slate-400 text-lg"
                  />
                  <ArrowRight className="w-5 h-5 text-blue-400 opacity-0 group-hover:opacity-100 transition" />
                </div>
              </div>
            </div>

            {/* Feature Pills */}
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              {features.map((feature, i) => (
                <div
                  key={i}
                  className="px-4 py-2 rounded-full bg-slate-700/40 border border-slate-600/50 text-sm text-slate-300 backdrop-blur-md hover:bg-slate-700/60 hover:border-slate-500 transition"
                  style={{ animation: `fade-in 0.8s ease-out ${i * 0.2}s both` }}
                >
                  <span className="mr-2">{feature.icon}</span>
                  {feature.label}
                </div>
              ))}
            </div>
          </div>

          {/* Company Logos Showcase */}
          <div className="relative z-20 mb-16 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
            <p className="text-center text-sm text-slate-400 mb-8 uppercase tracking-widest font-semibold">
              Hiring Companies
            </p>
            <div className="flex flex-wrap justify-center gap-6 lg:gap-8">
              {companyLogos.map((company, idx) => (
                <div
                  key={idx}
                  className="group relative"
                  style={{ animation: `bounce-in 0.6s ease-out ${idx * 0.1}s both` }}
                >
                  {/* Glow effect */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${company.color} rounded-2xl blur-xl opacity-0 group-hover:opacity-40 transition duration-500 transform group-hover:scale-110`} />
                  
                  {/* Card */}
                  <div className="relative bg-gradient-to-br from-slate-700/50 to-slate-800/50 backdrop-blur-md border border-slate-600/50 rounded-2xl p-6 w-32 h-32 flex flex-col items-center justify-center hover:border-slate-500/80 transition duration-300 transform hover:scale-105 hover:-translate-y-1">
                    <div className={`text-5xl mb-2 transform group-hover:scale-125 transition duration-300`}>
                      {company.emoji}
                    </div>
                    <p className="text-sm font-semibold text-slate-200 text-center">{company.name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="relative z-10 border-y border-slate-700/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { icon: '📋', label: 'Open Positions', value: jobs.length },
              { icon: '🎯', label: 'AI Evaluated', value: '100%' },
              { icon: '⚡', label: 'Avg Response', value: '< 2min' },
              { icon: '🏆', label: 'Success Rate', value: '94%' },
            ].map((stat, i) => (
              <div key={i} className="text-center group" style={{ animation: `fade-in 0.6s ease-out ${i * 0.15}s both` }}>
                <div className="text-3xl mb-2 group-hover:scale-125 transition duration-300">{stat.icon}</div>
                <p className="text-slate-400 text-sm mb-1">{stat.label}</p>
                <p className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Job Listings Section */}
      <section className="relative z-10 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div
                  key={i}
                  className="bg-slate-700/20 backdrop-blur-md rounded-2xl border border-slate-600/30 p-6 animate-pulse"
                  style={{ animation: `pulse 2s ease-in-out infinite` }}
                >
                  <div className="h-6 bg-slate-600/50 rounded w-1/3 mb-4" />
                  <div className="h-4 bg-slate-600/50 rounded w-2/3 mb-3" />
                  <div className="h-4 bg-slate-600/50 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-8xl mb-6">🔍</div>
              <h3 className="text-2xl font-bold text-slate-200 mb-2">No jobs found</h3>
              <p className="text-slate-400">Try a different search term or explore all positions</p>
            </div>
          ) : (
            <>
              <div className="grid gap-5">
                {filtered.slice(0, visibleJobs).map((job, idx) => {
                  const company = getCompanyLogo(idx);
                  const isHovered = hoveredJobId === job._id;

                  return (
                    <div
                      key={job._id}
                      onMouseEnter={() => setHoveredJobId(job._id)}
                      onMouseLeave={() => setHoveredJobId(null)}
                      className="group relative overflow-hidden rounded-2xl transition-all duration-300"
                      style={{ animation: `slide-in 0.6s ease-out ${idx * 0.1}s both` }}
                    >
                      {/* Background gradient */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${company.color} opacity-0 group-hover:opacity-5 transition duration-300`} />
                      <div className="absolute inset-0 bg-gradient-to-r from-slate-700/40 to-slate-800/40 backdrop-blur-xl border border-slate-600/50 group-hover:border-slate-500/80 rounded-2xl transition duration-300" />

                      {/* Content */}
                      <div className="relative p-6 md:p-7">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                          {/* Left Section */}
                          <div className="flex-1 min-w-0">
                            {/* Company + Title */}
                            <div className="flex items-start gap-4 mb-4">
                              {/* Company Logo */}
                              <div className={`flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br ${company.color} p-3 flex items-center justify-center text-2xl shadow-lg group-hover:shadow-2xl group-hover:scale-110 transition duration-300`}>
                                {company.emoji}
                              </div>

                              <div className="flex-1 min-w-0">
                                <h3 className="text-xl md:text-2xl font-bold text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-cyan-400 group-hover:bg-clip-text transition duration-300 mb-1">
                                  {job.title}
                                </h3>
                                <p className="text-sm text-slate-400">{company.name} • Posted {new Date(job.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                              </div>
                            </div>

                            {/* Description */}
                            <p className="text-slate-300 text-sm md:text-base mb-4 line-clamp-2 group-hover:text-slate-200 transition">
                              {job.description}
                            </p>

                            {/* Skills */}
                            {job.requiredSkills?.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {job.requiredSkills.slice(0, 5).map((skill, i) => (
                                  <span
                                    key={skill}
                                    className="px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-300 border border-blue-400/30 backdrop-blur-md hover:from-blue-500/40 hover:to-purple-500/40 transition"
                                    style={{ animation: `fade-in 0.5s ease-out ${i * 0.1}s both` }}
                                  >
                                    {skill}
                                  </span>
                                ))}
                                {job.requiredSkills.length > 5 && (
                                  <span className="px-3 py-1 rounded-full text-xs font-semibold text-slate-400">
                                    +{job.requiredSkills.length - 5} more
                                  </span>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Right Section - CTA */}
                          <div className="flex flex-col sm:flex-row md:flex-col gap-3 flex-shrink-0">
                            <Link
                              to={`/apply/${job._id}`}
                              className="group/btn relative inline-flex items-center justify-center px-6 py-3 rounded-xl font-semibold text-white overflow-hidden whitespace-nowrap transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
                            >
                              {/* Button gradient background */}
                              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-100 group-hover/btn:opacity-90 transition duration-300" />
                              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-400 opacity-0 group-hover/btn:opacity-100 transition duration-300 blur" />
                              
                              <span className="relative flex items-center gap-2">
                                Apply Now
                                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition duration-300" />
                              </span>
                            </Link>

                            <div className="flex items-center justify-center px-4 py-3 rounded-xl bg-slate-700/30 border border-slate-600/50 text-slate-300 text-sm font-medium whitespace-nowrap">
                              <span className="mr-2">🤖</span> AI Screened
                            </div>
                          </div>
                        </div>

                        {/* Hover reveal - Match insight */}
                        {isHovered && (
                          <div
                            className="mt-4 pt-4 border-t border-slate-600/50 text-sm text-slate-300 animate-in fade-in slide-in-from-bottom-2 duration-300"
                          >
                            <p>✨ <span className="text-blue-400 font-semibold">AI Insight:</span> Your profile matches 87% of requirements</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Load More Button */}
              {visibleJobs < filtered.length && (
                <div className="text-center mt-12">
                  <button
                    onClick={() => setVisibleJobs(v => v + 6)}
                    className="group relative inline-flex items-center justify-center px-8 py-4 rounded-xl font-bold text-white overflow-hidden transition-all duration-300 transform hover:scale-105"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 opacity-100 group-hover:opacity-90 transition" />
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 opacity-0 group-hover:opacity-100 transition blur animate-pulse" />
                    
                    <span className="relative flex items-center gap-2">
                      Load More Opportunities
                      <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition" />
                    </span>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Footer CTA Section */}
      <section className="relative z-10 border-t border-slate-700/50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to take the next step?
          </h2>
          <p className="text-slate-300 mb-8">
            Join thousands of professionals who've landed their dream role with AI-powered screening
          </p>
          <button className="group relative inline-flex items-center justify-center px-8 py-4 rounded-xl font-bold text-white overflow-hidden transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-cyan-600 opacity-100 group-hover:opacity-90 transition" />
            <span className="relative">Start Applying Now →</span>
          </button>
        </div>
      </section>

      {/* Custom Animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0px); }
          50% { transform: translate(0, 30px); }
        }
        @keyframes bounce-in {
          0% {
            opacity: 0;
            transform: scale(0.8) translateY(20px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        @keyframes slide-in {
          0% {
            opacity: 0;
            transform: translateX(-20px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes fade-in {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
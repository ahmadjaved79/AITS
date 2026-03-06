import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Layouts
import CandidateLayout from './layouts/CandidateLayout';
import RecruiterLayout from './layouts/RecruiterLayout';

// Candidate pages
import JobListPage from './pages/candidate/JobListPage';
import ApplyPage from './pages/candidate/ApplyPage';
import ValidationPage from './pages/ValidationPage';

// Auth
import LoginPage from './pages/LoginPage';

// Recruiter pages
import DashboardPage from './pages/recruiter/DashboardPage';
import CreateJobPage from './pages/recruiter/CreateJobPage';
import CandidatesPage from './pages/recruiter/CandidatesPage';
import CandidateDetailPage from './pages/recruiter/CandidateDetailPage';
import AnalyticsPage from './pages/recruiter/AnalyticsPage';

// ── Guards ────────────────────────────────────────────────────────────────────

/** Recruiter-only guard — original logic, untouched */
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  return user?.role === 'recruiter' ? children : <Navigate to="/login" replace />;
};

/**
 * NEW — Candidate guard.
 * Candidates must be logged in (role === 'candidate') to access
 * protected candidate routes like applying and taking validation tests.
 * Job browsing (/) stays public so anyone can see open positions.
 */
const CandidateRoute = ({ children }) => {
  const { user } = useAuth();
  return user?.role === 'candidate' ? children : <Navigate to="/login" replace />;
};

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <AuthProvider>
      <Routes>

        {/* ── Candidate Portal ── */}
        <Route element={<CandidateLayout />}>
          {/* Public — anyone can browse jobs */}
          <Route path="/" element={<JobListPage />} />

          {/* Protected — must be logged-in candidate to apply */}
          <Route
            path="/apply/:jobId"
            element={
              <CandidateRoute>
                <ApplyPage />
              </CandidateRoute>
            }
          />

          {/* Protected — must be logged-in candidate to take validation test */}
          <Route
            path="/validation/:validationId"
            element={
              <CandidateRoute>
                <ValidationPage />
              </CandidateRoute>
            }
          />
        </Route>

        {/* ── Auth ── (single page handles both recruiter + candidate tabs) */}
        <Route path="/login" element={<LoginPage />} />

        {/* ── Recruiter Portal ── original, untouched */}
        <Route path="/recruiter" element={<ProtectedRoute><RecruiterLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="create-job" element={<CreateJobPage />} />
          <Route path="candidates/:jobId" element={<CandidatesPage />} />
          <Route path="candidate/:id" element={<CandidateDetailPage />} />
          <Route path="analytics/:jobId" element={<AnalyticsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
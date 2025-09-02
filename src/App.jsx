// Updated App.jsx with Analytics Route
import React from 'react';
import { useAuth } from './contexts/AuthContext';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthContainer from './components/auth/AuthContainer';
import AuthenticatedApp from './components/AuthenticatedApp';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorBoundary from './components/ErrorBoundary';
import ResumeAnalyzer from './components/Resume/ResumeAnalyzer';
import AnalyticsDashboard from './components/Analytics/AnalyticsDashboard';

function App() {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <ErrorBoundary>
      <Router>
        {currentUser ? (
          <Routes>
            {/* Redirect root to dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            {/* All existing authenticated routes go through AuthenticatedApp */}
            <Route path="/dashboard" element={<AuthenticatedApp />} />
            <Route path="/profile" element={<AuthenticatedApp />} />
            <Route path="/journal" element={<AuthenticatedApp />} />
            
            {/* Resume Analyzer Route */}
            <Route path="/resume" element={<ResumeAnalyzer />} />
            
            {/* NEW: Analytics Dashboard Route */}
            <Route 
              path="/analytics" 
              element={
                <div className="min-h-screen bg-gray-50 py-8">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <AnalyticsDashboard analyzedResumes={[]} />
                  </div>
                </div>
              } 
            />
            
            {/* Catch all - redirect to dashboard */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        ) : (
          <AuthContainer />
        )}
      </Router>
    </ErrorBoundary>
  );
}

export default App;

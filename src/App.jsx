// Updated App.jsx with Dark Mode Support
import React from 'react';
import { useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext'; // Added ThemeProvider import
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
      <ThemeProvider>
        {/* Added dark mode classes and smooth transitions */}
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
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
                
                {/* Analytics Dashboard Route with dark mode support */}
                <Route 
                  path="/analytics" 
                  element={
                    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
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
        </div>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

// Enhanced AuthenticatedApp with migration support
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import MigrationModal from './MigrationModal';
import ErrorBoundary from './ErrorBoundary';
import Header from './Header';
import Hero from './Hero';
import Features from './Features';
import Footer from './Footer';
import JournalForm from './JournalForm';
import Dashboard from './Dashboard';
import Profile from './Profile';

export default function AuthenticatedApp() {
  const [currentView, setCurrentView] = useState('home');
  const [showMigration, setShowMigration] = useState(true);
  const { currentUser } = useAuth();
  const { isDarkMode } = useTheme();

  const handleStartJournal = () => setCurrentView('journal');
  const handleViewDashboard = () => setCurrentView('dashboard');
  const handleViewProfile = () => setCurrentView('profile');
  const handleBackToHome = () => setCurrentView('home');

  const handleMigrationComplete = () => {
    setShowMigration(false);
  };

  // Show migration modal first
  if (showMigration) {
    return (
      <ErrorBoundary>
        <MigrationModal onComplete={handleMigrationComplete} />
      </ErrorBoundary>
    );
  }

  // Journal Form
  if (currentView === 'journal') {
    return (
      <ErrorBoundary>
        <JournalForm 
          onBackToHome={handleBackToHome} 
          onViewDashboard={handleViewDashboard} 
        />
      </ErrorBoundary>
    );
  }

  // Dashboard
  if (currentView === 'dashboard') {
    return (
      <ErrorBoundary>
        <Dashboard 
          onBackToHome={handleBackToHome} 
          onStartJournal={handleStartJournal} 
        />
      </ErrorBoundary>
    );
  }

  // Profile
  if (currentView === 'profile') {
    return (
      <ErrorBoundary>
        <Profile 
          onBackToHome={handleBackToHome}
        />
      </ErrorBoundary>
    );
  }

  // Home/Landing Page
  return (
    <ErrorBoundary>
      <div className={`min-h-screen transition-colors duration-300 ${
        isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'
      }`}>
        <Header 
          onStartJournal={handleStartJournal} 
          onViewDashboard={handleViewDashboard}
          onViewProfile={handleViewProfile}
          currentView={currentView}
          currentUser={currentUser}
        />
        <Hero onStartJournal={handleStartJournal} />
        <Features />
        <Footer />
      </div>
    </ErrorBoundary>
  );
}

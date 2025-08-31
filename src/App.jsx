import { useState } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Features from './components/Features';
import Footer from './components/Footer';
import JournalForm from './components/JournalForm';
import Dashboard from './components/Dashboard';

function App() {
  const [currentView, setCurrentView] = useState('home'); // 'home', 'journal', 'dashboard'

  const handleStartJournal = () => {
    setCurrentView('journal');
  };

  const handleViewDashboard = () => {
    setCurrentView('dashboard');
  };

  const handleBackToHome = () => {
    setCurrentView('home');
  };

  // Render Journal Form
  if (currentView === 'journal') {
    return (
      <JournalForm 
        onBackToHome={handleBackToHome} 
        onViewDashboard={handleViewDashboard} 
      />
    );
  }

  // Render Dashboard
  if (currentView === 'dashboard') {
    return (
      <Dashboard 
        onBackToHome={handleBackToHome} 
        onStartJournal={handleStartJournal} 
      />
    );
  }

  // Render Landing Page
  return (
    <div className="min-h-screen bg-white">
      <Header 
        onStartJournal={handleStartJournal} 
        onViewDashboard={handleViewDashboard}
        currentView={currentView}
      />
      <Hero onStartJournal={handleStartJournal} />
      <Features />
      <Footer />
    </div>
  );
}

export default App;

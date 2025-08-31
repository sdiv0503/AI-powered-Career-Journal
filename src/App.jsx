import { useState } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Features from './components/Features';
import Footer from './components/Footer';
import JournalForm from './components/JournalForm';

function App() {
  const [currentView, setCurrentView] = useState('home'); // 'home' or 'journal'

  const handleStartJournal = () => {
    setCurrentView('journal');
  };

  const handleBackToHome = () => {
    setCurrentView('home');
  };

  // Render Journal Form
  if (currentView === 'journal') {
    return <JournalForm onBackToHome={handleBackToHome} />;
  }

  // Render Landing Page
  return (
    <div className="min-h-screen bg-white">
      <Header onStartJournal={handleStartJournal} />
      <Hero onStartJournal={handleStartJournal} />
      <Features />
      <Footer />
    </div>
  );
}

export default App;

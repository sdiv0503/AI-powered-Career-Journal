// Updated Dashboard.jsx with Professional Dark Mode Support
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import { getUserJournalEntries, deleteJournalEntry } from '../services/journalService';
import EntryCard from './EntryCard';
import EditModal from './EditModal';
import LoadingSpinner from './LoadingSpinner';
import { StreakService } from '../services/streakService';
import { useNavigate } from 'react-router-dom';

function Dashboard({ onBackToHome, onStartJournal }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date-desc');
  const [streakData, setStreakData] = useState({ 
    currentStreak: 0, 
    longestStreak: 0,
    totalEntries: 0,
    lastEntryDate: null
  });

  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Load streak data when component mounts
  useEffect(() => {
    if (!currentUser) return;

    const loadStreakData = async () => {
      try {
        const streakService = new StreakService(currentUser.uid);
        const data = await streakService.validateCurrentStreak();
        setStreakData(data);
      } catch (error) {
        console.error('Error loading streak data:', error);
      }
    };

    loadStreakData();
  }, [currentUser]);

  // Real-time listener for entries
  useEffect(() => {
    if (!currentUser) return;

    const entriesQuery = query(
      collection(db, 'users', currentUser.uid, 'journalEntries'),
      orderBy('date', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(
      entriesQuery,
      (snapshot) => {
        const entriesData = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          entriesData.push({
            id: doc.id,
            ...data
          });
        });

        setEntries(entriesData);
        setLoading(false);

        // Reload streak data when entries change
        const loadStreakData = async () => {
          try {
            const streakService = new StreakService(currentUser.uid);
            const data = await streakService.validateCurrentStreak();
            setStreakData(data);
          } catch (error) {
            console.error('Error reloading streak data:', error);
          }
        };
        loadStreakData();
      },
      (error) => {
        console.error('Firestore listener error:', error);
        loadEntries();
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  // Fallback manual loading
  const loadEntries = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      setError(null);
      const userEntries = await getUserJournalEntries(currentUser.uid);
      setEntries(userEntries);

      // Load streak data
      const streakService = new StreakService(currentUser.uid);
      const data = await streakService.validateCurrentStreak();
      setStreakData(data);
    } catch (error) {
      console.error('Error loading entries:', error);
      setError('Failed to load journal entries. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Delete entry function with Firestore
  const handleDeleteEntry = async (entryId) => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this journal entry? This action cannot be undone.'
    );
    
    if (confirmDelete) {
      try {
        await deleteJournalEntry(currentUser.uid, entryId);
        setEntries(prev => prev.filter(entry => entry.id !== entryId));
        
        // Reload streak data after deletion
        const streakService = new StreakService(currentUser.uid);
        const updatedStreakData = await streakService.validateCurrentStreak();
        setStreakData(updatedStreakData);
      } catch (error) {
        console.error('Error deleting entry:', error);
        alert('Failed to delete entry. Please try again.');
      }
    }
  };

  // Edit entry function
  const handleEditEntry = (entry) => {
    setEditingEntry(entry);
    setIsEditModalOpen(true);
  };

  // Save edited entry
  const handleSaveEdit = (updatedEntry) => {
    setEntries(prev => prev.map(entry => 
      entry.id === updatedEntry.id ? updatedEntry : entry
    ));
    setIsEditModalOpen(false);
    setEditingEntry(null);
  };

  // Navigate to resume analyzer
  const handleResumeAnalyzer = () => {
    navigate('/resume');
  };

  // Filter and sort entries
  const filteredAndSortedEntries = entries
    .filter(entry => {
      const lowerSearch = searchTerm.toLowerCase();
      return (
        entry.progress?.toLowerCase().includes(lowerSearch) ||
        entry.technologies?.some(tech => 
          tech.toLowerCase().includes(lowerSearch)
        ) ||
        new Date(entry.date).toLocaleDateString().includes(searchTerm)
      );
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return new Date(b.date) - new Date(a.date);
        case 'date-asc':
          return new Date(a.date) - new Date(b.date);
        case 'productivity':
          return (b.productivity || 5) - (a.productivity || 5);
        default:
          return 0;
      }
    });

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <button 
            onClick={loadEntries}
            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white px-4 py-2 rounded-lg transition-colors duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900/50 transition-colors duration-300">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-100 dark:border-gray-700 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 transition-colors duration-300">📊 Dashboard</h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1 transition-colors duration-300">
                {entries.length} journal {entries.length === 1 ? 'entry' : 'entries'}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={onBackToHome}
                className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium py-2 px-4 rounded-lg transition-all duration-300"
              >
                🏠 Home
              </button>
              
              <button
                onClick={handleResumeAnalyzer}
                className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-medium py-2 px-6 rounded-lg transition duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
              >
                📄 Resume Analyzer
              </button>
              
              <button
                onClick={onStartJournal}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium py-2 px-6 rounded-lg transition duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
              >
                ✏️ New Entry
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Streak Display */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 mb-8 transition-all duration-300 hover:shadow-md dark:hover:shadow-gray-900/25">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 transition-colors duration-300">🔥 Current Streak</h2>
              <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300">Consecutive days of journaling</p>
              <div className="mt-2 space-y-1">
                <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                  Longest streak: <span className="font-semibold text-gray-700 dark:text-gray-300">{streakData.longestStreak || 0} days</span>
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                  Total entries: <span className="font-semibold text-gray-700 dark:text-gray-300">{streakData.totalEntries || entries.length}</span>
                </p>
                {streakData.lastEntryDate && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                    Last entry: <span className="font-semibold text-gray-700 dark:text-gray-300">
                      {new Date(streakData.lastEntryDate).toLocaleDateString()}
                    </span>
                  </p>
                )}
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2 transition-colors duration-300">
                {streakData.currentStreak || 0}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                {(streakData.currentStreak || 0) === 1 ? 'day' : 'days'}
              </div>
            </div>
          </div>
        </div>

        {/* Feature Callout */}
        <div className="bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/20 dark:to-indigo-900/20 border border-purple-200 dark:border-purple-700/50 rounded-xl p-6 mb-8 transition-all duration-300 hover:shadow-md dark:hover:shadow-purple-900/25">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-purple-900 dark:text-purple-300 mb-2 transition-colors duration-300">🚀 New Feature: Resume Analyzer</h3>
              <p className="text-purple-700 dark:text-purple-400 mb-3 transition-colors duration-300">
                Upload your resume to get AI-powered skill analysis, gap identification, and career insights.
              </p>
              <ul className="text-sm text-purple-600 dark:text-purple-400 space-y-1 transition-colors duration-300">
                <li>• 📄 PDF parsing and text extraction</li>
                <li>• 🔍 Skill identification across 100+ technologies</li>
                <li>• 📊 Career progression analysis</li>
                <li>• 💡 Personalized improvement recommendations</li>
              </ul>
            </div>
            <div className="ml-6">
              <button
                onClick={handleResumeAnalyzer}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-3 px-6 rounded-xl transition duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Try Resume Analyzer →
              </button>
            </div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 mb-8 transition-all duration-300 hover:shadow-md dark:hover:shadow-gray-900/25">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                🔍 Search Entries
              </label>
              <input
                type="text"
                placeholder="Search by progress, technologies, or date..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-300"
              />
            </div>

            {/* Sort */}
            <div className="md:w-64">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                📅 Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-all duration-300"
              >
                <option value="date-desc">Latest First</option>
                <option value="date-asc">Oldest First</option>
                <option value="productivity">By Productivity</option>
              </select>
            </div>
          </div>
        </div>

        {/* Entries Grid */}
        {filteredAndSortedEntries.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2 transition-colors duration-300">
              {searchTerm ? 'No entries found' : 'No journal entries yet'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto transition-colors duration-300">
              {searchTerm 
                ? 'Try adjusting your search terms or filters.'
                : 'Start your coding journey by creating your first journal entry!'
              }
            </p>
            {!searchTerm && (
              <button
                onClick={onStartJournal}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-3 px-8 rounded-lg transition duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                ✏️ Create First Entry 🚀
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedEntries.map((entry) => (
              <EntryCard
                key={entry.id}
                entry={entry}
                onEdit={handleEditEntry}
                onDelete={handleDeleteEntry}
              />
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && editingEntry && (
        <EditModal
          entry={editingEntry}
          onSave={handleSaveEdit}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingEntry(null);
          }}
        />
      )}
    </div>
  );
}

export default Dashboard;

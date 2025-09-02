// Updated Dashboard with Resume Analyzer link
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import { getUserJournalEntries, deleteJournalEntry } from '../services/journalService';
import EntryCard from './EntryCard';
import EditModal from './EditModal';
import LoadingSpinner from './LoadingSpinner';
import { StreakService } from '../services/streakService';

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
    window.location.href = '/resume';
  };

  // Navigate to profile
  const handleProfile = () => {
    window.location.href = '/profile';
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={loadEntries}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">📊 Dashboard</h1>
              <p className="text-gray-600 mt-1">
                {entries.length} journal {entries.length === 1 ? 'entry' : 'entries'}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={onBackToHome}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition duration-300"
              >
                🏠 Home
              </button>
              <button
                onClick={handleProfile}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition duration-300"
              >
                👤 Profile
              </button>
              {/* NEW: Resume Analyzer Button */}
              <button
                onClick={handleResumeAnalyzer}
                className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-medium py-2 px-6 rounded-lg transition duration-300 shadow-md"
              >
                📄 Resume Analyzer
              </button>
              <button
                onClick={onStartJournal}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium py-2 px-6 rounded-lg transition duration-300"
              >
                ✏️ New Entry
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Streak Display */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">🔥 Current Streak</h2>
              <p className="text-gray-600">Consecutive days of journaling</p>
              <div className="mt-2 space-y-1">
                <p className="text-sm text-gray-500">
                  Longest streak: <span className="font-semibold">{streakData.longestStreak || 0} days</span>
                </p>
                <p className="text-sm text-gray-500">
                  Total entries: <span className="font-semibold">{streakData.totalEntries || entries.length}</span>
                </p>
                {streakData.lastEntryDate && (
                  <p className="text-sm text-gray-500">
                    Last entry: <span className="font-semibold">
                      {new Date(streakData.lastEntryDate).toLocaleDateString()}
                    </span>
                  </p>
                )}
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {streakData.currentStreak || 0}
              </div>
              <div className="text-sm text-gray-500">
                {(streakData.currentStreak || 0) === 1 ? 'day' : 'days'}
              </div>
            </div>
          </div>
        </div>

        {/* Phase 4 Feature Callout */}
        <div className="bg-gradient-to-r from-purple-100 to-indigo-100 border border-purple-200 rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-purple-900 mb-2">🚀 New Feature: Resume Analyzer</h3>
              <p className="text-purple-700 mb-3">
                Upload your resume to get AI-powered skill analysis, gap identification, and career insights.
              </p>
              <ul className="text-sm text-purple-600 space-y-1">
                <li>• 📄 PDF parsing and text extraction</li>
                <li>• 🔍 Skill identification across 100+ technologies</li>
                <li>• 📊 Career progression analysis</li>
                <li>• 💡 Personalized improvement recommendations</li>
              </ul>
            </div>
            <div className="ml-6">
              <button
                onClick={handleResumeAnalyzer}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-3 px-6 rounded-xl transition duration-300 shadow-lg transform hover:scale-105"
              >
                Try Resume Analyzer →
              </button>
            </div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🔍 Search Entries
              </label>
              <input
                type="text"
                placeholder="Search by progress, technologies, or date..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Sort */}
            <div className="md:w-64">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📅 Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {searchTerm ? 'No entries found' : 'No journal entries yet'}
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              {searchTerm 
                ? 'Try adjusting your search terms or filters.'
                : 'Start your coding journey by creating your first journal entry!'
              }
            </p>
            {!searchTerm && (
              <button
                onClick={onStartJournal}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-3 px-8 rounded-lg transition duration-300"
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

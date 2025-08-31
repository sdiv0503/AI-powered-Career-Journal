import { useState, useEffect } from 'react';
import EntryCard from './EntryCard';
import EditModal from './EditModal';

function Dashboard({ onBackToHome, onStartJournal }) {
  const [entries, setEntries] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date-desc');

  // Load entries from localStorage on component mount
  useEffect(() => {
    const savedEntries = localStorage.getItem('journalEntries');
    if (savedEntries) {
      setEntries(JSON.parse(savedEntries));
    }
  }, []);

  // Save entries to localStorage whenever entries change
  const saveEntriesToStorage = (updatedEntries) => {
    localStorage.setItem('journalEntries', JSON.stringify(updatedEntries));
    setEntries(updatedEntries);
  };

  // Delete entry function
  const handleDeleteEntry = (entryId) => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this journal entry? This action cannot be undone.'
    );
    
    if (confirmDelete) {
      const updatedEntries = entries.filter(entry => entry.id !== entryId);
      saveEntriesToStorage(updatedEntries);
    }
  };

  // Edit entry function
  const handleEditEntry = (entry) => {
    setEditingEntry(entry);
    setIsEditModalOpen(true);
  };

  // Save edited entry
  const handleSaveEdit = (updatedEntry) => {
    const updatedEntries = entries.map(entry => 
      entry.id === updatedEntry.id ? updatedEntry : entry
    );
    saveEntriesToStorage(updatedEntries);
    setIsEditModalOpen(false);
    setEditingEntry(null);
  };

  // Filter and sort entries
  const filteredAndSortedEntries = entries
    .filter(entry => 
      entry.progress.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.technologies.some(tech => 
        tech.toLowerCase().includes(searchTerm.toLowerCase())
      ) ||
      new Date(entry.date).toLocaleDateString().includes(searchTerm)
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return new Date(b.date) - new Date(a.date);
        case 'date-asc':
          return new Date(a.date) - new Date(b.date);
        case 'mood':
          return a.mood.localeCompare(b.mood);
        default:
          return 0;
      }
    });

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
                <option value="mood">By Mood</option>
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
                Create First Entry 🚀
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

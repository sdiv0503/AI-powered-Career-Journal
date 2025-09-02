// Updated Profile.jsx using persistent streak data from StreakContext
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { getUserProfileWithStats, updateUserDisplayName } from '../services/userService';
import LoadingSpinner from './LoadingSpinner';
import { StreakService } from '../services/streakService';

export default function Profile({ onBackToHome }) {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState('');
  const [saving, setSaving] = useState(false);
  const [streakData, setStreakData] = useState({
    currentStreak: 0,
    longestStreak: 0,
    totalEntries: 0,
    lastEntryDate: null
  });

  const { currentUser, userProfile } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();

  // Load streak data
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

  useEffect(() => {
    loadProfileData();
  }, [currentUser]);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getUserProfileWithStats(currentUser.uid);
      setProfileData(data);
      setNewDisplayName(data.profile.displayName || '');
    } catch (error) {
      console.error('Error loading profile:', error);
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDisplayName = async () => {
    if (!newDisplayName.trim() || newDisplayName === profileData.profile.displayName) {
      setEditing(false);
      return;
    }

    try {
      setSaving(true);
      await updateUserDisplayName(currentUser, newDisplayName.trim());
      
      setProfileData(prev => ({
        ...prev,
        profile: {
          ...prev.profile,
          displayName: newDisplayName.trim()
        }
      }));
      
      setEditing(false);
    } catch (error) {
      console.error('Error updating display name:', error);
      alert('Failed to update display name. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(part => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Never';
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getProductivityTrendIcon = (trend) => {
    switch (trend) {
      case 'improving': return '📈';
      case 'declining': return '📉';
      default: return '➖';
    }
  };

  const getStreakEmoji = (streak) => {
    if (streak >= 30) return '🔥🔥🔥';
    if (streak >= 7) return '🔥🔥';
    if (streak >= 3) return '🔥';
    return '📝';
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-600">{error}</div>;
  if (!profileData) return <div className="min-h-screen flex items-center justify-center">No profile data found</div>;

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
    }`}>
      {/* Header */}
      <div className={`border-b transition-colors duration-300 ${
        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">👤 Profile</h1>
            <button
              onClick={onBackToHome}
              className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                isDarkMode 
                  ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' 
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              🏠 Home
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Info Card */}
          <div className={`rounded-2xl p-6 transition-colors duration-300 ${
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          } border shadow-lg`}>
            <div className="text-center">
              {/* Avatar */}
              <div className={`w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-bold transition-colors duration-300 ${
                isDarkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
              }`}>
                {getInitials(profileData.profile.displayName)}
              </div>

              {/* Name */}
              {editing ? (
                <div className="mb-4">
                  <input
                    type="text"
                    value={newDisplayName}
                    onChange={(e) => setNewDisplayName(e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border text-center font-semibold transition-colors duration-300 ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' 
                        : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                    placeholder="Enter your name"
                    onKeyPress={(e) => e.key === 'Enter' && handleSaveDisplayName()}
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={handleSaveDisplayName}
                      disabled={saving}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors duration-200 disabled:opacity-50"
                    >
                      {saving ? '⏳' : '✅'}
                    </button>
                    <button
                      onClick={() => {
                        setEditing(false);
                        setNewDisplayName(profileData.profile.displayName || '');
                      }}
                      className={`flex-1 px-3 py-1 rounded text-sm font-medium transition-colors duration-200 ${
                        isDarkMode 
                          ? 'bg-gray-600 hover:bg-gray-500 text-gray-200' 
                          : 'bg-gray-300 hover:bg-gray-400 text-gray-700'
                      }`}
                    >
                      ❌
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mb-4">
                  <h2 className="text-xl font-bold mb-1">
                    {profileData.profile.displayName || 'Anonymous User'}
                  </h2>
                  <button
                    onClick={() => setEditing(true)}
                    className={`text-sm transition-colors duration-200 ${
                      isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'
                    }`}
                  >
                    ✏️ Edit name
                  </button>
                </div>
              )}

              {/* Email */}
              <p className={`text-sm mb-6 transition-colors duration-300 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {profileData.profile.email}
              </p>

              {/* Member Since */}
              <div className={`text-xs p-3 rounded-lg transition-colors duration-300 ${
                isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
              }`}>
                📅 Member since {formatDate(profileData.profile.createdAt)}
              </div>

              {/* Persistent Streak Display */}
              <div className="mt-4 p-4 bg-gradient-to-r from-orange-400 to-red-500 text-white rounded-xl shadow-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold mb-1">
                    🔥 {streakData.currentStreak || 0}
                  </div>
                  <p className="text-sm opacity-90">
                    {(streakData.currentStreak || 0) === 1 ? 'Day Streak' : 'Days Streak'}
                  </p>
                  <div className="flex justify-between text-xs opacity-80 mt-2 pt-2 border-t border-white/20">
                    <span>Best: {streakData.longestStreak || 0}d</span>
                    <span>Total: {streakData.totalEntries || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Stats Grid - Updated with persistent streak data */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className={`p-4 rounded-xl text-center transition-colors duration-300 ${
                isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              } border`}>
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {profileData.stats.totalEntries}
                </div>
                <div className={`text-xs transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Total Entries
                </div>
              </div>

              <div className={`p-4 rounded-xl text-center transition-colors duration-300 ${
                isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              } border`}>
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {profileData.stats.totalHours}h
                </div>
                <div className={`text-xs transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Coding Hours
                </div>
              </div>

              <div className={`p-4 rounded-xl text-center transition-colors duration-300 ${
                isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              } border`}>
                <div className="text-2xl font-bold text-orange-600 mb-1 flex items-center justify-center">
                  {getStreakEmoji(streakData.currentStreak || 0)}
                  {streakData.currentStreak || 0}
                </div>
                <div className={`text-xs transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Current Streak
                </div>
              </div>

              <div className={`p-4 rounded-xl text-center transition-colors duration-300 ${
                isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              } border`}>
                <div className="text-2xl font-bold text-purple-600 mb-1">
                  {profileData.stats.totalQuickWins}
                </div>
                <div className={`text-xs transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Quick Wins
                </div>
              </div>
            </div>

            {/* Detailed Stats */}
            <div className={`p-6 rounded-2xl transition-colors duration-300 ${
              isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            } border`}>
              <h3 className="text-lg font-bold mb-4">📊 Performance Metrics</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Averages */}
                <div>
                  <h4 className={`font-semibold mb-3 transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-200' : 'text-gray-700'
                  }`}>
                    Average Scores
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className={`text-sm transition-colors duration-300 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        Productivity
                      </span>
                      <span className="font-semibold">
                        {profileData.stats.averageProductivity}/10
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={`text-sm transition-colors duration-300 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        Focus
                      </span>
                      <span className="font-semibold">
                        {profileData.stats.averageFocus}/10
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={`text-sm transition-colors duration-300 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        Energy
                      </span>
                      <span className="font-semibold">
                        {profileData.stats.averageEnergy}/10
                      </span>
                    </div>
                  </div>
                </div>

                {/* Trends - Updated with persistent streak data */}
                <div>
                  <h4 className={`font-semibold mb-3 transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-200' : 'text-gray-700'
                  }`}>
                    Trends & Streaks
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className={`text-sm transition-colors duration-300 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        Productivity Trend
                      </span>
                      <span className="font-semibold">
                        {getProductivityTrendIcon(profileData.stats.productivityTrend)}
                        {profileData.stats.productivityTrend}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={`text-sm transition-colors duration-300 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        Longest Streak
                      </span>
                      <span className="font-semibold">
                        {streakData.longestStreak || 0} days
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={`text-sm transition-colors duration-300 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        Last Entry
                      </span>
                      <span className="font-semibold">
                        {streakData.lastEntryDate ? new Date(streakData.lastEntryDate).toLocaleDateString() : 'None'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Technologies */}
            {profileData.stats.topTechnologies.length > 0 && (
              <div className={`p-6 rounded-2xl transition-colors duration-300 ${
                isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              } border`}>
                <h3 className="text-lg font-bold mb-4">💻 Top Technologies</h3>
                <div className="flex flex-wrap gap-2">
                  {profileData.stats.topTechnologies.map((tech, index) => (
                    <span
                      key={tech.name}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors duration-300 ${
                        index === 0 
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100'
                          : index === 1
                          ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                      }`}
                    >
                      {tech.name} ({tech.count})
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Settings */}
            <div className={`p-6 rounded-2xl transition-colors duration-300 ${
              isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            } border`}>
              <h3 className="text-lg font-bold mb-4">⚙️ Settings</h3>
              
              <div className="space-y-4">
                {/* Dark Mode Toggle */}
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className={`font-medium transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-200' : 'text-gray-700'
                    }`}>
                      Dark Mode
                    </h4>
                    <p className={`text-sm transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      Toggle between light and dark themes
                    </p>
                  </div>
                  <button
                    onClick={toggleTheme}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                      isDarkMode ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        isDarkMode ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

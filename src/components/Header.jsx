// Enhanced header with profile navigation and dark mode
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import DarkModeToggle from './DarkModeToggle';

function Header({ onStartJournal, onViewDashboard, onViewProfile, currentView, currentUser, userProfile }) {
  const { logout } = useAuth();
  const { isDarkMode } = useTheme();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  return (
    <header className={`shadow-sm border-b transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-100'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo/Brand */}
          <div className="flex items-center gap-4">
            <h1 className={`text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600`}>
              🌟 Career Journal
            </h1>
            {userProfile && (
              <span className={`text-sm transition-colors duration-300 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Welcome back, {userProfile.displayName?.split(' ')[0] || 'there'}!
              </span>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center gap-3">
            {/* Dark Mode Toggle */}
            <DarkModeToggle showLabel={false} size="sm" />
            
            {/* Navigation Links */}
            {currentView !== 'dashboard' && (
              <button
                onClick={onViewDashboard}
                className={`px-6 py-2 rounded-lg font-medium transition-all duration-300 ${
                  isDarkMode
                    ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                📊 Dashboard
              </button>
            )}
            
            {currentView !== 'journal' && (
              <button
                onClick={onStartJournal}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium py-2 px-6 rounded-lg transition-all duration-300 transform hover:scale-105"
              >
                ✏️ New Entry
              </button>
            )}
            
            {/* User Menu */}
            <div className="relative flex items-center gap-2">
              {currentView !== 'profile' && (
                <button
                  onClick={onViewProfile}
                  className={`p-2 rounded-lg transition-colors duration-300 ${
                    isDarkMode
                      ? 'text-gray-300 hover:bg-gray-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  title="View Profile"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </button>
              )}
              
              <button
                onClick={handleLogout}
                className={`flex items-center gap-2 font-medium py-2 px-4 rounded-lg transition-colors duration-300 ${
                  isDarkMode
                    ? 'bg-red-900/20 text-red-400 hover:bg-red-900/30'
                    : 'bg-red-50 text-red-700 hover:bg-red-100'
                }`}
                title="Sign Out"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;

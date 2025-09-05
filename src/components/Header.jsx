import React from 'react';
import { Link } from 'react-router-dom'; // Add this import
import { useAuth } from '../contexts/AuthContext';

function Header({ onStartJournal, onViewDashboard, onViewProfile, currentView, userProfile }) {
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo/Brand Section - Now Clickable */}
          <div className="flex items-center gap-8">
            {/* Replace div with Link component */}
            <Link 
              to="/" 
              className="flex items-center gap-5 group cursor-pointer hover:opacity-90 transition-opacity duration-200"
            >
              {/* Logo */}
              <div className="relative flex-shrink-0">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-200/30 to-purple-200/30 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                <img 
                  src="images/skill sync logo favicon-circle.png" 
                  alt="SkillSync Logo" 
                  className="relative h-16 w-16 object-contain transition-all duration-300 group-hover:scale-110 drop-shadow-lg"
                />
              </div>
              
              {/* Typography with Light Mode Colors */}
              <div className="flex flex-col justify-center">
                <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 bg-clip-text text-transparent tracking-tight mb-2">
                  SkillSync
                </h1>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></div>
                  <span className="text-xs font-bold text-gray-600 tracking-[0.2em] uppercase leading-none">
                    AI-Powered Career Intelligence
                  </span>
                  <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
                </div>
              </div>
            </Link>
            
            {/* Welcome Message */}
            {userProfile && (
              <div className="hidden xl:flex items-center gap-4 ml-10 pl-8 border-l border-gray-300/60">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg">
                      {userProfile.displayName?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full"></div>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800 leading-tight">
                      {userProfile.displayName?.split(' ')[0] || 'User'}
                    </p>
                    <p className="text-xs text-gray-500 font-medium">
                      Career Sync Active
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Navigation - Same as before */}
          <nav className="flex items-center gap-3">
            {currentView !== 'dashboard' && (
              <button
                onClick={onViewDashboard}
                className="group relative inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 hover:border-gray-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-all duration-200"
              >
                <svg className="w-4 h-4 text-gray-500 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span className="hidden sm:inline">Dashboard</span>
              </button>
            )}
            
            {currentView !== 'journal' && (
              <button
                onClick={onStartJournal}
                className="group relative inline-flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="hidden sm:inline">New Entry</span>
                <span className="sm:hidden">New</span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300"></div>
              </button>
            )}
            
            <div className="flex items-center gap-2 ml-3 pl-3 border-l border-gray-200">
              {currentView !== 'profile' && (
                <button
                  onClick={onViewProfile}
                  className="p-2.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                  title="View Profile"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </button>
              )}
              
              <button
                onClick={handleLogout}
                className="group inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 hover:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 transition-all duration-200"
                title="Sign Out"
              >
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="hidden md:inline">Sign Out</span>
              </button>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}

export default Header;

// Reusable dark mode toggle component
import { useTheme } from '../contexts/ThemeContext';

export default function DarkModeToggle({ showLabel = true, size = 'md' }) {
  const { isDarkMode, toggleTheme, isLoading } = useTheme();

  const sizeClasses = {
    sm: 'h-5 w-9',
    md: 'h-6 w-11',
    lg: 'h-7 w-14'
  };

  const thumbSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4', 
    lg: 'h-5 w-5'
  };

  const translateX = {
    sm: isDarkMode ? 'translate-x-5' : 'translate-x-1',
    md: isDarkMode ? 'translate-x-6' : 'translate-x-1',
    lg: isDarkMode ? 'translate-x-8' : 'translate-x-1'
  };

  if (isLoading) {
    return (
      <div className={`${sizeClasses[size]} bg-gray-200 rounded-full animate-pulse`} />
    );
  }

  return (
    <div className="flex items-center gap-3">
      {showLabel && (
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {isDarkMode ? '🌙 Dark' : '☀️ Light'}
        </span>
      )}
      
      <button
        onClick={toggleTheme}
        className={`relative inline-flex ${sizeClasses[size]} items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
          isDarkMode 
            ? 'bg-blue-600 hover:bg-blue-700' 
            : 'bg-gray-300 hover:bg-gray-400'
        }`}
        role="switch"
        aria-checked={isDarkMode}
        aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
      >
        <span
          className={`inline-block ${thumbSizes[size]} transform rounded-full bg-white shadow-lg transition-transform duration-300 ${translateX[size]}`}
        />
      </button>
    </div>
  );
}

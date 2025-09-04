import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { cva } from 'class-variance-authority';

// --- Configuration placed outside the component for better performance ---

// CVA configuration for the toggle track (the button background)
const trackStyles = cva(
  [
    'relative inline-flex items-center rounded-full',
    'transition-all duration-300 ease-in-out',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    'focus:ring-blue-500 dark:focus:ring-offset-gray-900 cursor-pointer',
  ],
  {
    variants: {
      variant: {
        default: '', // Gradients are handled by isDarkMode
        minimal: 'bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600',
      },
      isDarkMode: {
        true: '',
        false: '',
      },
      size: {
        sm: 'h-6 w-12',
        md: 'h-7 w-14',
        lg: 'h-8 w-16',
      },
    },
    // Compound variants for default gradient styles
    compoundVariants: [
      {
        variant: 'default',
        isDarkMode: true,
        class: 'bg-gradient-to-r from-indigo-600 to-blue-600',
      },
      {
        variant: 'default',
        isDarkMode: false,
        class: 'bg-gradient-to-r from-amber-400 to-orange-400',
      },
    ],
    defaultVariants: {
      size: 'md',
      variant: 'default',
    },
  }
);

// CVA configuration for the toggle thumb (the moving circle)
const thumbStyles = cva(
  [
    'inline-flex items-center justify-center rounded-full bg-white',
    'shadow-lg ring-0 transform transition-all duration-300 ease-in-out',
  ],
  {
    variants: {
      isDarkMode: {
        true: '',
        false: 'translate-x-0.5',
      },
      size: {
        sm: 'h-5 w-5',
        md: 'h-6 w-6',
        lg: 'h-7 w-7',
      },
    },
    // Compound variants to handle the thumb's position based on size
    compoundVariants: [
      { size: 'sm', isDarkMode: true, class: 'translate-x-6' },
      { size: 'md', isDarkMode: true, class: 'translate-x-7' },
      { size: 'lg', isDarkMode: true, class: 'translate-x-8' },
    ],
    defaultVariants: {
      size: 'md',
    },
  }
);

// --- The Component ---

export default function DarkModeToggle({ showLabel = true, size = 'md', variant = 'default' }) {
  const { isDarkMode, toggleTheme, isLoading } = useTheme();

  const iconSize = { sm: 'w-3 h-3', md: 'w-4 h-4', lg: 'w-5 h-5' }[size];
  const textSize = { sm: 'text-sm', md: 'text-sm', lg: 'text-base' }[size];

  // Loading Skeleton
  if (isLoading) {
    const skeletonSize = { sm: 'h-6 w-12', md: 'h-7 w-14', lg: 'h-8 w-16' }[size];
    return (
      <div className={`${skeletonSize} bg-gray-300 dark:bg-gray-700 rounded-full animate-pulse`} />
    );
  }

  return (
    <div className="flex items-center space-x-3">
      {/* Label */}
      {showLabel && (
        <label
          htmlFor="dark-mode-toggle"
          className={`font-medium select-none cursor-pointer text-gray-700 dark:text-gray-300 ${textSize}`}
        >
          {isDarkMode ? 'Dark Mode' : 'Light Mode'}
        </label>
      )}

      {/* Toggle Button */}
      <button
        id="dark-mode-toggle"
        type="button"
        role="switch"
        aria-checked={isDarkMode}
        aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
        onClick={toggleTheme}
        className={trackStyles({ variant, isDarkMode, size })}
      >
        {/* Thumb */}
        <span className={thumbStyles({ isDarkMode, size })}>
          {/* Icon */}
          <span className={`${iconSize} transition-colors duration-300`}>
            {isDarkMode ? (
              <svg fill="currentColor" viewBox="0 0 20 20" className="text-indigo-500">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            ) : (
              <svg fill="currentColor" viewBox="0 0 20 20" className="text-amber-500">
                <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" />
              </svg>
            )}
          </span>
        </span>
      </button>
    </div>
  );
}
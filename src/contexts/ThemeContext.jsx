// Global theme management with dark mode support
// Why Context? Theme affects every component - avoid prop drilling

import { createContext, useContext, useState, useEffect } from 'react';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from './AuthContext';

const ThemeContext = createContext();

// Custom hook for using theme context
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export function ThemeProvider({ children }) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { currentUser } = useAuth();

  // Load theme preference on mount
  useEffect(() => {
    loadThemePreference();
  }, [currentUser]);

  // Apply theme to document root
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const loadThemePreference = async () => {
    try {
      if (currentUser) {
        // Load from Firestore user profile
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setIsDarkMode(userData.settings?.darkMode || false);
        }
      } else {
        // Load from localStorage for non-authenticated users
        const saved = localStorage.getItem('darkMode');
        if (saved !== null) {
          setIsDarkMode(JSON.parse(saved));
        } else {
          // Respect system preference as fallback
          const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          setIsDarkMode(systemPrefersDark);
        }
      }
    } catch (error) {
      console.error('Error loading theme preference:', error);
      // Fallback to system preference
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(systemPrefersDark);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTheme = async () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);

    try {
      if (currentUser) {
        // Save to Firestore
        await updateDoc(doc(db, 'users', currentUser.uid), {
          'settings.darkMode': newTheme,
          'settings.lastUpdated': new Date().toISOString()
        });
      } else {
        // Save to localStorage
        localStorage.setItem('darkMode', JSON.stringify(newTheme));
      }
    } catch (error) {
      console.error('Error saving theme preference:', error);
      // Still update UI even if save fails
    }
  };

  const value = {
    isDarkMode,
    toggleTheme,
    isLoading
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

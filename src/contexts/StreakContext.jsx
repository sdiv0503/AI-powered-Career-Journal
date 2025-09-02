import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { getUserStreakData } from '../services/streakService';

const StreakContext = createContext();

export const useStreak = () => {
  const context = useContext(StreakContext);
  if (!context) {
    throw new Error('useStreak must be used within StreakProvider');
  }
  return context;
};

export const StreakProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [streakData, setStreakData] = useState({
    currentStreak: 0,
    longestStreak: 0,
    lastEntryDate: null,
    totalEntries: 0,
    loading: true
  });

  // Load streak data when user changes
  useEffect(() => {
    if (!currentUser) {
      setStreakData({
        currentStreak: 0,
        longestStreak: 0,
        lastEntryDate: null,
        totalEntries: 0,
        loading: false
      });
      return;
    }

    const loadStreakData = async () => {
      try {
        const data = await getUserStreakData(currentUser.uid);
        setStreakData({
          ...data,
          loading: false
        });
      } catch (error) {
        console.error('Error loading streak data:', error);
        setStreakData(prev => ({ ...prev, loading: false }));
      }
    };

    loadStreakData();
  }, [currentUser]);

  // Function to refresh streak data
  const refreshStreakData = async () => {
    if (!currentUser) return;
    
    try {
      const data = await getUserStreakData(currentUser.uid);
      setStreakData({
        ...data,
        loading: false
      });
    } catch (error) {
      console.error('Error refreshing streak data:', error);
    }
  };

  const value = {
    ...streakData,
    refreshStreakData
  };

  return (
    <StreakContext.Provider value={value}>
      {children}
    </StreakContext.Provider>
  );
};

import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';

// Centralized streak management service
export class StreakService {
  constructor(userId) {
    this.userId = userId;
    this.streakDocRef = doc(db, 'users', userId, 'system', 'streak');
  }

  // Get user's streak data from Firestore
  async getStreakData() {
    try {
      const streakDoc = await getDoc(this.streakDocRef);
      
      if (streakDoc.exists()) {
        return streakDoc.data();
      } else {
        // Initialize streak data if it doesn't exist
        const initialStreakData = {
          currentStreak: 0,
          longestStreak: 0,
          lastEntryDate: null,
          totalEntries: 0,
          streakStartDate: null,
          updatedAt: serverTimestamp()
        };
        
        await setDoc(this.streakDocRef, initialStreakData);
        return initialStreakData;
      }
    } catch (error) {
      console.error('Error getting streak data:', error);
      return {
        currentStreak: 0,
        longestStreak: 0,
        lastEntryDate: null,
        totalEntries: 0,
        streakStartDate: null
      };
    }
  }

  // Update streak when a new entry is created
  async updateStreakOnNewEntry(entryDate) {
    try {
      const streakData = await this.getStreakData();
      const today = new Date().toISOString().slice(0, 10);
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      
      console.log('Updating streak for date:', entryDate);
      console.log('Current streak data:', streakData);
      
      let newStreakData = { ...streakData };
      
      // If this is the first entry ever
      if (!streakData.lastEntryDate) {
        newStreakData = {
          currentStreak: 1,
          longestStreak: 1,
          lastEntryDate: entryDate,
          totalEntries: 1,
          streakStartDate: entryDate,
          updatedAt: serverTimestamp()
        };
      }
      // If entry is for today and no entry exists for today yet
      else if (entryDate === today && streakData.lastEntryDate !== today) {
        // Check if streak continues (yesterday was the last entry)
        if (streakData.lastEntryDate === yesterday) {
          newStreakData.currentStreak += 1;
        } else {
          // Streak broken, start new streak
          newStreakData.currentStreak = 1;
          newStreakData.streakStartDate = entryDate;
        }
        
        newStreakData.lastEntryDate = entryDate;
        newStreakData.totalEntries += 1;
        newStreakData.longestStreak = Math.max(newStreakData.longestStreak, newStreakData.currentStreak);
        newStreakData.updatedAt = serverTimestamp();
      }
      // If entry is for yesterday and no entry exists for yesterday
      else if (entryDate === yesterday && streakData.lastEntryDate !== yesterday) {
        // This maintains or starts a streak
        if (streakData.lastEntryDate === entryDate) {
          // Don't update if entry already exists for this date
          return streakData;
        }
        
        newStreakData.currentStreak = streakData.currentStreak > 0 ? streakData.currentStreak + 1 : 1;
        newStreakData.lastEntryDate = entryDate;
        newStreakData.totalEntries += 1;
        newStreakData.longestStreak = Math.max(newStreakData.longestStreak, newStreakData.currentStreak);
        newStreakData.updatedAt = serverTimestamp();
      }
      // Entry for a past date or duplicate
      else {
        console.log('Entry date not eligible for streak update:', entryDate);
        return streakData; // No streak update needed
      }
      
      console.log('New streak data:', newStreakData);
      
      await updateDoc(this.streakDocRef, newStreakData);
      return newStreakData;
      
    } catch (error) {
      console.error('Error updating streak:', error);
      throw error;
    }
  }

  // Check and update streak based on current date (call this on login)
  async validateCurrentStreak() {
    try {
      const streakData = await this.getStreakData();
      const today = new Date().toISOString().slice(0, 10);
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      
      // If no entries yet, streak remains 0
      if (!streakData.lastEntryDate) {
        return streakData;
      }
      
      // If last entry was today or yesterday, streak continues
      if (streakData.lastEntryDate === today || streakData.lastEntryDate === yesterday) {
        return streakData;
      }
      
      // If last entry was before yesterday, streak is broken
      const lastEntryDate = new Date(streakData.lastEntryDate);
      const yesterdayDate = new Date(yesterday);
      
      if (lastEntryDate < yesterdayDate) {
        const brokenStreakData = {
          ...streakData,
          currentStreak: 0,
          streakStartDate: null,
          updatedAt: serverTimestamp()
        };
        
        await updateDoc(this.streakDocRef, brokenStreakData);
        return brokenStreakData;
      }
      
      return streakData;
      
    } catch (error) {
      console.error('Error validating streak:', error);
      return { currentStreak: 0, longestStreak: 0 };
    }
  }
}

// Helper functions for components
export const getUserStreakData = async (userId) => {
  const streakService = new StreakService(userId);
  return await streakService.validateCurrentStreak();
};

export const updateUserStreak = async (userId, entryDate) => {
  const streakService = new StreakService(userId);
  return await streakService.updateStreakOnNewEntry(entryDate);
};

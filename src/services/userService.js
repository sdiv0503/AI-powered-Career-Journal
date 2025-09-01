// User profile management and statistics
// Why separate service? Centralized user operations, easier to test

import { doc, getDoc, updateDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { db } from '../firebase/config';

// Get comprehensive user profile with statistics
export const getUserProfileWithStats = async (userId) => {
  try {
    // Get user profile
    const userDoc = await getDoc(doc(db, 'users', userId));
    
    if (!userDoc.exists()) {
      throw new Error('User profile not found');
    }

    const userData = userDoc.data();

    // Get journal entry statistics
    const journalEntriesRef = collection(db, 'users', userId, 'journalEntries');
    const entriesSnapshot = await getDocs(journalEntriesRef);
    
    const entries = entriesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Calculate statistics
    const stats = calculateUserStats(entries);
    
    return {
      profile: userData,
      stats: {
        ...stats,
        totalEntries: entries.length,
        lastEntryDate: entries.length > 0 ? 
          Math.max(...entries.map(e => new Date(e.date).getTime())) : null
      }
    };
  } catch (error) {
    console.error('Error fetching user profile with stats:', error);
    throw error;
  }
};

// Calculate comprehensive user statistics
const calculateUserStats = (entries) => {
  if (entries.length === 0) {
    return {
      totalHours: 0,
      averageProductivity: 0,
      averageFocus: 0,
      averageEnergy: 0,
      currentStreak: 0,
      longestStreak: 0,
      totalQuickWins: 0,
      topTechnologies: [],
      mostActiveMonth: null,
      productivityTrend: 'neutral'
    };
  }

  // Calculate total coding hours
  const totalHours = entries.reduce((acc, entry) => {
    const timeSpent = entry.timeSpent || { hours: 0, minutes: 0 };
    return acc + timeSpent.hours + (timeSpent.minutes / 60);
  }, 0);

  // Calculate averages
  const averageProductivity = entries.reduce((acc, entry) => acc + (entry.productivity || 5), 0) / entries.length;
  const averageFocus = entries.reduce((acc, entry) => acc + (entry.focus || 5), 0) / entries.length;
  const averageEnergy = entries.reduce((acc, entry) => acc + (entry.energy || 5), 0) / entries.length;

  // Calculate streaks
  const streaks = calculateStreaks(entries);

  // Count quick wins
  const totalQuickWins = entries.reduce((acc, entry) => {
    return acc + (entry.quickWins?.filter(win => win && win.trim()).length || 0);
  }, 0);

  // Get top technologies
  const techCounts = {};
  entries.forEach(entry => {
    entry.technologies?.forEach(tech => {
      techCounts[tech] = (techCounts[tech] || 0) + 1;
    });
  });
  
  const topTechnologies = Object.entries(techCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([tech, count]) => ({ name: tech, count }));

  // Find most active month
  const monthCounts = {};
  entries.forEach(entry => {
    const month = new Date(entry.date).toISOString().slice(0, 7); // YYYY-MM
    monthCounts[month] = (monthCounts[month] || 0) + 1;
  });
  
  const mostActiveMonth = Object.entries(monthCounts)
    .sort(([,a], [,b]) => b - a)[0]?.[0];

  // Calculate productivity trend (last 7 entries vs previous 7)
  const recentEntries = entries.slice(0, 7);
  const previousEntries = entries.slice(7, 14);
  
  let productivityTrend = 'neutral';
  if (recentEntries.length >= 3 && previousEntries.length >= 3) {
    const recentAvg = recentEntries.reduce((acc, e) => acc + (e.productivity || 5), 0) / recentEntries.length;
    const previousAvg = previousEntries.reduce((acc, e) => acc + (e.productivity || 5), 0) / previousEntries.length;
    
    if (recentAvg > previousAvg + 0.5) productivityTrend = 'improving';
    else if (recentAvg < previousAvg - 0.5) productivityTrend = 'declining';
  }

  return {
    totalHours: Math.round(totalHours * 10) / 10, // Round to 1 decimal
    averageProductivity: Math.round(averageProductivity * 10) / 10,
    averageFocus: Math.round(averageFocus * 10) / 10,
    averageEnergy: Math.round(averageEnergy * 10) / 10,
    currentStreak: streaks.current,
    longestStreak: streaks.longest,
    totalQuickWins,
    topTechnologies,
    mostActiveMonth,
    productivityTrend
  };
};

// Calculate current and longest streaks
const calculateStreaks = (entries) => {
  if (entries.length === 0) return { current: 0, longest: 0 };

  // Sort entries by date (newest first)
  const sortedEntries = entries
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .map(entry => entry.date);

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  // Check if user has entry today or yesterday (for current streak)
  const latestEntryDate = new Date(sortedEntries[0]);
  const daysDiff = Math.floor((today - latestEntryDate) / (1000 * 60 * 60 * 24));
  
  if (daysDiff <= 1) {
    // Start counting current streak
    let checkDate = new Date(latestEntryDate);
    
    for (const entryDate of sortedEntries) {
      const entry = new Date(entryDate);
      const expectedDate = new Date(checkDate);
      
      if (entry.toDateString() === expectedDate.toDateString()) {
        currentStreak++;
        tempStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
  }

  // Find longest streak
  tempStreak = 1;
  let prevDate = new Date(sortedEntries[0]);
  
  for (let i = 1; i < sortedEntries.length; i++) {
    const currentDate = new Date(sortedEntries[i]);
    const expectedPrevDate = new Date(prevDate);
    expectedPrevDate.setDate(expectedPrevDate.getDate() - 1);
    
    if (currentDate.toDateString() === expectedPrevDate.toDateString()) {
      tempStreak++;
    } else {
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 1;
    }
    
    prevDate = currentDate;
  }
  
  longestStreak = Math.max(longestStreak, tempStreak);

  return {
    current: currentStreak,
    longest: longestStreak
  };
};

// Update user profile
export const updateUserProfile = async (userId, updates) => {
  try {
    await updateDoc(doc(db, 'users', userId), {
      ...updates,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// Update user display name in both Auth and Firestore
export const updateUserDisplayName = async (user, newDisplayName) => {
  try {
    // Update Firebase Auth profile
    await updateProfile(user, { displayName: newDisplayName });
    
    // Update Firestore document
    await updateDoc(doc(db, 'users', user.uid), {
      displayName: newDisplayName,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating display name:', error);
    throw error;
  }
};

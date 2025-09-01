// Complete Journal Service with all required exports
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy,
  limit,
  where
} from 'firebase/firestore';
import { db } from '../firebase/config';

class JournalService {
  constructor() {
    this.listeners = new Map();
  }

  // Get user journal entries - REQUIRED by Dashboard
  async getUserJournalEntries(userId, limitCount = 20) {
    try {
      const entriesRef = collection(db, 'users', userId, 'journalEntries');
      const q = query(
        entriesRef, 
        orderBy('date', 'desc'), 
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching journal entries:', error);
      return [];
    }
  }

  // Delete journal entry - REQUIRED by Dashboard
  async deleteJournalEntry(userId, entryId) {
    try {
      const entryRef = doc(db, 'users', userId, 'journalEntries', entryId);
      await deleteDoc(entryRef);
      return { success: true };
    } catch (error) {
      console.error('Error deleting journal entry:', error);
      throw error;
    }
  }

  // Add journal entry - Used by JournalForm
  async addJournalEntry(userId, entryData) {
    try {
      const entriesRef = collection(db, 'users', userId, 'journalEntries');
      const docRef = await addDoc(entriesRef, {
        ...entryData,
        timestamp: new Date().toISOString(),
        userId: userId
      });
      
      return docRef.id;
    } catch (error) {
      console.error('Error adding journal entry:', error);
      throw error;
    }
  }

  // Update journal entry - Used by EditModal
  async updateJournalEntry(userId, entryId, entryData) {
    try {
      const entryRef = doc(db, 'users', userId, 'journalEntries', entryId);
      await updateDoc(entryRef, {
        ...entryData,
        updatedAt: new Date().toISOString()
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error updating journal entry:', error);
      throw error;
    }
  }

  // Get single journal entry - Used by EditModal
  async getJournalEntry(userId, entryId) {
    try {
      const entryRef = doc(db, 'users', userId, 'journalEntries', entryId);
      const docSnapshot = await getDoc(entryRef);
      
      if (docSnapshot.exists()) {
        return {
          id: docSnapshot.id,
          ...docSnapshot.data()
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching journal entry:', error);
      throw error;
    }
  }

  // Get entries by date range - Used for filtering
  async getJournalEntriesByDateRange(userId, startDate, endDate) {
    try {
      const entriesRef = collection(db, 'users', userId, 'journalEntries');
      const q = query(
        entriesRef,
        where('date', '>=', startDate),
        where('date', '<=', endDate),
        orderBy('date', 'desc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching entries by date range:', error);
      return [];
    }
  }

  // Search entries - Used for search functionality
  async searchJournalEntries(userId, searchTerm) {
    try {
      const entriesRef = collection(db, 'users', userId, 'journalEntries');
      const querySnapshot = await getDocs(entriesRef);
      
      const allEntries = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Client-side filtering (Firestore doesn't support full-text search)
      const searchLower = searchTerm.toLowerCase();
      return allEntries.filter(entry => 
        entry.progress?.toLowerCase().includes(searchLower) ||
        entry.learnings?.toLowerCase().includes(searchLower) ||
        entry.challenges?.toLowerCase().includes(searchLower) ||
        entry.technologies?.some(tech => tech.toLowerCase().includes(searchLower))
      );
    } catch (error) {
      console.error('Error searching journal entries:', error);
      return [];
    }
  }

  // Get user statistics - Used by Dashboard stats
  async getUserStats(userId) {
    try {
      const entriesRef = collection(db, 'users', userId, 'journalEntries');
      const querySnapshot = await getDocs(entriesRef);
      
      const entries = querySnapshot.docs.map(doc => doc.data());
      
      return {
        totalEntries: entries.length,
        totalTimeSpent: entries.reduce((total, entry) => {
          const time = entry.timeSpent || { hours: 0, minutes: 0 };
          return total + time.hours * 60 + time.minutes;
        }, 0),
        averageEnergy: entries.length > 0 
          ? entries.reduce((sum, entry) => sum + (entry.energy || 0), 0) / entries.length 
          : 0,
        averageProductivity: entries.length > 0
          ? entries.reduce((sum, entry) => sum + (entry.productivity || 0), 0) / entries.length
          : 0,
        uniqueTechnologies: [...new Set(entries.flatMap(entry => entry.technologies || []))],
        entriesThisWeek: entries.filter(entry => {
          const entryDate = new Date(entry.date);
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return entryDate >= weekAgo;
        }).length
      };
    } catch (error) {
      console.error('Error fetching user stats:', error);
      return {
        totalEntries: 0,
        totalTimeSpent: 0,
        averageEnergy: 0,
        averageProductivity: 0,
        uniqueTechnologies: [],
        entriesThisWeek: 0
      };
    }
  }

  // Cleanup method
  cleanup() {
    this.listeners.forEach(unsubscribe => unsubscribe());
    this.listeners.clear();
  }
}

// Create and export service instance
const journalService = new JournalService();

// Named exports - REQUIRED by your components
export const getUserJournalEntries = (userId, limit) => journalService.getUserJournalEntries(userId, limit);
export const deleteJournalEntry = (userId, entryId) => journalService.deleteJournalEntry(userId, entryId);
export const addJournalEntry = (userId, entryData) => journalService.addJournalEntry(userId, entryData);
export const updateJournalEntry = (userId, entryId, entryData) => journalService.updateJournalEntry(userId, entryId, entryData);
export const getJournalEntry = (userId, entryId) => journalService.getJournalEntry(userId, entryId);
export const getJournalEntriesByDateRange = (userId, startDate, endDate) => journalService.getJournalEntriesByDateRange(userId, startDate, endDate);
export const searchJournalEntries = (userId, searchTerm) => journalService.searchJournalEntries(userId, searchTerm);
export const getUserStats = (userId) => journalService.getUserStats(userId);

// Default export
export default journalService;

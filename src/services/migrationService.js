// Data migration from localStorage to Firebase
import { collection, addDoc, doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

export class MigrationService {
  constructor() {
    this.MIGRATION_KEY = 'migration_status';
    this.LEGACY_DATA_KEY = 'journalEntries';
  }

  // Check if user needs migration
  async needsMigration(userId) {
    try {
      // Check if user has migration status in Firestore
      const migrationDoc = await getDoc(doc(db, 'users', userId, 'system', 'migration'));
      
      if (migrationDoc.exists() && migrationDoc.data().completed) {
        return false; // Already migrated
      }

      // Check if user has legacy localStorage data
      const legacyData = this.getLegacyData();
      return legacyData && legacyData.length > 0;
    } catch (error) {
      console.error('Error checking migration status:', error);
      return false;
    }
  }

  // Get legacy data from localStorage
  getLegacyData() {
    try {
      const data = localStorage.getItem(this.LEGACY_DATA_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error reading legacy data:', error);
      return null;
    }
  }

  // Perform migration
  async migrateUserData(userId, onProgress) {
    try {
      const legacyData = this.getLegacyData();
      
      if (!legacyData || legacyData.length === 0) {
        await this.markMigrationComplete(userId);
        return { success: true, migrated: 0 };
      }

      let migrated = 0;
      const total = legacyData.length;

      // Create migration status document
      await setDoc(doc(db, 'users', userId, 'system', 'migration'), {
        started: new Date().toISOString(),
        total: total,
        completed: false,
        progress: 0
      });

      // Migrate each entry
      for (const entry of legacyData) {
        try {
          // Transform localStorage format to Firebase format
          const transformedEntry = this.transformEntry(entry);
          
          // Add to user's journal entries collection
          await addDoc(collection(db, 'users', userId, 'journalEntries'), transformedEntry);
          
          migrated++;
          
          // Update progress
          if (onProgress) {
            onProgress(migrated, total);
          }

          // Update migration progress in Firebase
          await setDoc(doc(db, 'users', userId, 'system', 'migration'), {
            started: new Date().toISOString(),
            total: total,
            completed: false,
            progress: Math.round((migrated / total) * 100),
            lastUpdated: new Date().toISOString()
          });

        } catch (entryError) {
          console.error(`Error migrating entry ${entry.id}:`, entryError);
          // Continue with next entry - don't fail entire migration
        }
      }

      // Mark migration as complete
      await this.markMigrationComplete(userId, migrated);

      // Archive legacy data (don't delete immediately)
      this.archiveLegacyData();

      return { success: true, migrated };

    } catch (error) {
      console.error('Migration failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Transform entry from localStorage format to Firebase format
  transformEntry(entry) {
    return {
      date: entry.date,
      progress: entry.progress || '',
      technologies: entry.technologies || [],
      activities: entry.activities || [],
      timeSpent: entry.timeSpent || { hours: 0, minutes: 0 },
      mood: entry.mood || 'okay',
      energy: entry.energy || 5,
      productivity: entry.productivity || 5,
      focus: entry.focus || 5,
      quickWins: entry.quickWins || [],
      challenges: entry.challenges || '',
      learnings: entry.learnings || '',
      timestamp: entry.timestamp || new Date().toISOString(),
      migrated: true,
      migratedAt: new Date().toISOString()
    };
  }

  // Mark migration as complete
  async markMigrationComplete(userId, migratedCount = 0) {
    await setDoc(doc(db, 'users', userId, 'system', 'migration'), {
      completed: true,
      completedAt: new Date().toISOString(),
      migratedEntries: migratedCount,
      progress: 100
    });
  }

  // Archive legacy data instead of deleting
  archiveLegacyData() {
    const legacyData = this.getLegacyData();
    if (legacyData) {
      // Keep backup in different key
      localStorage.setItem('journalEntries_backup', JSON.stringify(legacyData));
      localStorage.setItem('migration_archived_at', new Date().toISOString());
    }
  }

  // Clean up legacy data (call after successful migration verification)
  cleanupLegacyData() {
    localStorage.removeItem(this.LEGACY_DATA_KEY);
    localStorage.setItem('legacy_cleanup_at', new Date().toISOString());
  }
}

export default new MigrationService();

// User-friendly migration interface
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import migrationService from '../services/migrationService';

export default function MigrationModal({ onComplete }) {
  const [migrationState, setMigrationState] = useState('checking'); // checking, ready, migrating, complete, error
  const [progress, setProgress] = useState(0);
  const [migrated, setMigrated] = useState(0);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState(null);

  const { currentUser } = useAuth();

  useEffect(() => {
    checkMigrationStatus();
  }, [currentUser]);

  const checkMigrationStatus = async () => {
    try {
      if (!currentUser) return;

      const needsMigration = await migrationService.needsMigration(currentUser.uid);
      
      if (!needsMigration) {
        setMigrationState('complete');
        onComplete();
        return;
      }

      const legacyData = migrationService.getLegacyData();
      setTotal(legacyData?.length || 0);
      setMigrationState('ready');
    } catch (error) {
      setError(error.message);
      setMigrationState('error');
    }
  };

  const startMigration = async () => {
    setMigrationState('migrating');
    setError(null);

    try {
      const result = await migrationService.migrateUserData(
        currentUser.uid,
        (migratedCount, totalCount) => {
          setMigrated(migratedCount);
          setProgress(Math.round((migratedCount / totalCount) * 100));
        }
      );

      if (result.success) {
        setMigrationState('complete');
        setTimeout(() => {
          onComplete();
        }, 2000);
      } else {
        setError(result.error);
        setMigrationState('error');
      }
    } catch (error) {
      setError(error.message);
      setMigrationState('error');
    }
  };

  const skipMigration = () => {
    onComplete();
  };

  if (migrationState === 'checking') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-gray-900">Checking your data...</h3>
          </div>
        </div>
      </div>
    );
  }

  if (migrationState === 'ready') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Welcome to Career Journal 3.0!</h3>
            <p className="text-gray-600">
              We found {total} journal entries from your previous sessions. 
              Let's migrate them to your secure, cloud-based account.
            </p>
          </div>

          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-blue-900 mb-2">What will happen:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Your {total} entries will be securely transferred</li>
              <li>• Data will be backed up before migration</li>
              <li>• This process takes less than a minute</li>
              <li>• You can access your data from any device</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <button
              onClick={startMigration}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium py-3 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 transition duration-200"
            >
              Migrate My Data
            </button>
            <button
              onClick={skipMigration}
              className="px-4 py-3 text-gray-600 hover:text-gray-800 font-medium"
            >
              Skip
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (migrationState === 'migrating') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Migrating Your Data</h3>
            <p className="text-gray-600 mb-6">
              Transferring {migrated} of {total} entries...
            </p>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
              <div 
                className="bg-gradient-to-r from-blue-600 to-purple-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-500">{progress}% complete</p>
          </div>
        </div>
      </div>
    );
  }

  if (migrationState === 'complete') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Migration Complete!</h3>
            <p className="text-gray-600 mb-4">
              Successfully migrated {migrated} journal entries to your secure account.
            </p>
            <p className="text-sm text-green-600 font-medium">
              Welcome to Career Journal 3.0! 🎉
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (migrationState === 'error') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Migration Failed</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <div className="flex gap-3">
              <button
                onClick={startMigration}
                className="flex-1 bg-red-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-red-700 transition duration-200"
              >
                Try Again
              </button>
              <button
                onClick={skipMigration}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
              >
                Skip for Now
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

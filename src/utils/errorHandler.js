// Centralized error handling utilities
export class NetworkError extends Error {
  constructor(message, status, code) {
    super(message);
    this.name = 'NetworkError';
    this.status = status;
    this.code = code;
  }
}

export class ValidationError extends Error {
  constructor(message, field) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
  }
}

export const errorHandler = {
  // Handle Firebase Auth errors
  handleAuthError(error) {
    const errorMessages = {
      'auth/user-not-found': 'No account found with this email address',
      'auth/wrong-password': 'Incorrect password',
      'auth/email-already-in-use': 'An account with this email already exists',
      'auth/weak-password': 'Password should be at least 6 characters',
      'auth/invalid-email': 'Please enter a valid email address',
      'auth/network-request-failed': 'Network error. Please check your connection and try again',
      'auth/too-many-requests': 'Too many failed attempts. Please try again later',
      'auth/operation-not-allowed': 'This sign-in method is not enabled',
      'auth/user-disabled': 'This account has been disabled'
    };

    return errorMessages[error.code] || 'Authentication failed. Please try again.';
  },

  // Handle Firestore errors
  handleFirestoreError(error) {
    const errorMessages = {
      'permission-denied': 'You don\'t have permission to access this data',
      'not-found': 'The requested data was not found',
      'already-exists': 'This data already exists',
      'resource-exhausted': 'Too many requests. Please try again later',
      'failed-precondition': 'The operation was rejected due to system state',
      'aborted': 'The operation was aborted due to a conflict',
      'out-of-range': 'Invalid data range provided',
      'unimplemented': 'This feature is not yet implemented',
      'internal': 'Internal server error. Please try again',
      'unavailable': 'Service is currently unavailable',
      'unauthenticated': 'Please sign in to continue',
      'deadline-exceeded': 'Request timeout. Please try again'
    };

    return errorMessages[error.code] || 'An error occurred. Please try again.';
  },

  // Handle network connectivity
  async checkNetworkStatus() {
    if (!navigator.onLine) {
      throw new NetworkError('No internet connection', 0, 'offline');
    }

    try {
      const response = await fetch('/favicon.ico', { 
        method: 'HEAD', 
        cache: 'no-cache' 
      });
      
      if (!response.ok) {
        throw new NetworkError('Network connectivity issue', response.status, 'connectivity');
      }
    } catch (error) {
      throw new NetworkError('Network connectivity issue', 0, 'connectivity');
    }
  },

  // Retry mechanism for failed operations
  async withRetry(operation, maxRetries = 3, delay = 1000) {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        
        // Don't retry for certain error types
        if (error.code === 'permission-denied' || 
            error.code === 'unauthenticated' || 
            error.code === 'not-found') {
          throw error;
        }

        if (attempt === maxRetries) {
          break;
        }

        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempt - 1)));
      }
    }
    
    throw lastError;
  }
};

// Custom hook for error handling
export function useErrorHandler() {
  const handleError = (error, context = 'general') => {
    let userMessage = 'An unexpected error occurred';

    if (error.code) {
      if (error.code.startsWith('auth/')) {
        userMessage = errorHandler.handleAuthError(error);
      } else {
        userMessage = errorHandler.handleFirestoreError(error);
      }
    } else if (error instanceof NetworkError) {
      userMessage = error.message;
    } else if (error instanceof ValidationError) {
      userMessage = error.message;
    }

    // Log error for debugging
    console.error(`Error in ${context}:`, error);

    return userMessage;
  };

  return { handleError };
}

// Test error handling utilities
import { describe, it, expect } from 'vitest';
import { errorHandler, NetworkError, ValidationError } from '../../utils/errorHandler';

describe('ErrorHandler', () => {
  describe('handleAuthError', () => {
    it('returns user-friendly message for auth/user-not-found', () => {
      const error = { code: 'auth/user-not-found' };
      const message = errorHandler.handleAuthError(error);
      
      expect(message).toBe('No account found with this email address');
    });

    it('returns generic message for unknown error codes', () => {
      const error = { code: 'auth/unknown-error' };
      const message = errorHandler.handleAuthError(error);
      
      expect(message).toBe('Authentication failed. Please try again.');
    });

    it('handles network request failed error', () => {
      const error = { code: 'auth/network-request-failed' };
      const message = errorHandler.handleAuthError(error);
      
      expect(message).toBe('Network error. Please check your connection and try again');
    });
  });

  describe('handleFirestoreError', () => {
    it('handles permission denied errors', () => {
      const error = { code: 'permission-denied' };
      const message = errorHandler.handleFirestoreError(error);
      
      expect(message).toBe('You don\'t have permission to access this data');
    });

    it('handles not found errors', () => {
      const error = { code: 'not-found' };
      const message = errorHandler.handleFirestoreError(error);
      
      expect(message).toBe('The requested data was not found');
    });
  });

  describe('NetworkError', () => {
    it('creates network error with correct properties', () => {
      const error = new NetworkError('Connection failed', 500, 'timeout');
      
      expect(error.name).toBe('NetworkError');
      expect(error.message).toBe('Connection failed');
      expect(error.status).toBe(500);
      expect(error.code).toBe('timeout');
    });
  });

  describe('ValidationError', () => {
    it('creates validation error with field information', () => {
      const error = new ValidationError('Email is required', 'email');
      
      expect(error.name).toBe('ValidationError');
      expect(error.message).toBe('Email is required');
      expect(error.field).toBe('email');
    });
  });
});

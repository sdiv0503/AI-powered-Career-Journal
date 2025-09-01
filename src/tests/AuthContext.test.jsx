// Simplified AuthContext test - no hoisting issues
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

// Mock Firebase modules with self-contained factories (no external variables)
vi.mock('../firebase/config', () => ({
  auth: {},
  db: {},
}));

vi.mock('firebase/auth', () => ({
  onAuthStateChanged: vi.fn((auth, callback) => {
    callback(null); // No user by default
    return vi.fn(); // Return unsubscribe function
  }),
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  setDoc: vi.fn(),
  getDoc: vi.fn(() => Promise.resolve({ exists: () => false })),
}));

// Import after mocks
import { AuthProvider, useAuth } from '../contexts/AuthContext';

// Simple test component
function TestComponent() {
  const { currentUser, login, logout } = useAuth();
  return (
    <div>
      <div data-testid="user-status">
        {currentUser ? currentUser.email : 'No user'}
      </div>
      <button onClick={() => login('test@example.com', 'password')}>
        Login
      </button>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

describe('AuthContext', () => {
  it('provides authentication context', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('user-status')).toHaveTextContent('No user');
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  it('handles no user state correctly', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('user-status')).toHaveTextContent('No user');
  });

  it('renders auth provider without crashing', () => {
    render(
      <AuthProvider>
        <div>Auth provider works</div>
      </AuthProvider>
    );

    expect(screen.getByText('Auth provider works')).toBeInTheDocument();
  });
});

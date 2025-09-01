// Basic App component test
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from '../App';

// Mock contexts to avoid Firebase dependencies
vi.mock('../contexts/AuthContext', () => ({
  AuthProvider: ({ children }) => children,
  useAuth: () => ({
    currentUser: null,
    loading: false,
    login: vi.fn(),
    logout: vi.fn(),
  }),
}));

vi.mock('../contexts/ThemeContext', () => ({
  ThemeProvider: ({ children }) => children,
  useTheme: () => ({
    isDarkMode: false,
    toggleTheme: vi.fn(),
    isLoading: false,
  }),
}));

describe('App Component', () => {
  it('renders without crashing', () => {
    render(<App />);
    // Should render authentication container when no user
    expect(screen.getByText(/Sign in to your Career Journal/i)).toBeInTheDocument();
  });
});

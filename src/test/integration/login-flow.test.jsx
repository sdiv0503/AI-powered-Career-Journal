// Simple integration test that actually works
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import App from '../../App';

// Mock the auth context properly
const mockAuthContext = {
  currentUser: null,
  loading: false,
  login: vi.fn(),
  logout: vi.fn(),
  signup: vi.fn()
};

vi.mock('../../contexts/AuthContext', () => ({
  AuthProvider: ({ children }) => children,
  useAuth: () => mockAuthContext,
}));

vi.mock('../../contexts/ThemeContext', () => ({
  ThemeProvider: ({ children }) => children,
  useTheme: () => ({
    isDarkMode: false,
    toggleTheme: vi.fn(),
    isLoading: false,
  }),
}));

describe('Login Flow Integration', () => {
  it('shows login form when not authenticated', () => {
    render(<App />);
    
    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it('allows user to attempt login', async () => {
    mockAuthContext.login.mockResolvedValue({});
    
    render(<App />);
    
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const loginButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(mockAuthContext.login).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });
});

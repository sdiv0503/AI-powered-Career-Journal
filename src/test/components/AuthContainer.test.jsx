// Fixed AuthContainer test - avoid duplicate text matching
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AuthContainer from '../../components/auth/AuthContainer';

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({ login: vi.fn(), signup: vi.fn() }),
}));

describe('AuthContainer', () => {
  it('renders login form by default', () => {
    render(<AuthContainer />);
    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    expect(screen.getByText('Sign in to your Career Journal')).toBeInTheDocument();
  });

  it('switches to signup form', () => {
    render(<AuthContainer />);
    
    // Click the "Sign up" link to switch modes
    fireEvent.click(screen.getByText(/sign up/i));
    
    // Check for the signup form's unique elements instead of duplicate text
    expect(screen.getByText('Start your coding journey today')).toBeInTheDocument();
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
  });

  it('switches back to login form', () => {
    render(<AuthContainer />);
    
    // Go to signup first
    fireEvent.click(screen.getByText(/sign up/i));
    expect(screen.getByText('Start your coding journey today')).toBeInTheDocument();
    
    // Go back to login
    fireEvent.click(screen.getByText(/sign in/i));
    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    expect(screen.getByText('Sign in to your Career Journal')).toBeInTheDocument();
  });
});

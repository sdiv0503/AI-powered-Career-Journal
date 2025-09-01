// Quick win - test simple components
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import LoadingSpinner from '../../components/LoadingSpinner';

describe('LoadingSpinner', () => {
  it('renders loading message', () => {
    render(<LoadingSpinner />);
    expect(screen.getByText('Career Journal')).toBeInTheDocument();
    expect(screen.getByText('Loading your workspace...')).toBeInTheDocument();
  });

  it('shows spinner animation', () => {
    render(<LoadingSpinner />);
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });
});

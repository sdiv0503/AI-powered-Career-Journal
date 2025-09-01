// Basic test to ensure Vitest is working
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

// Simple component for testing
function HelloWorld({ name = 'World' }) {
  return <h1>Hello {name}!</h1>;
}

describe('Basic Test', () => {
  it('renders hello world', () => {
    render(<HelloWorld />);
    expect(screen.getByText('Hello World!')).toBeInTheDocument();
  });

  it('renders with custom name', () => {
    render(<HelloWorld name="Vitest" />);
    expect(screen.getByText('Hello Vitest!')).toBeInTheDocument();
  });

  it('basic math works', () => {
    expect(2 + 2).toBe(4);
    expect(Math.max(1, 2, 3)).toBe(3);
  });
});

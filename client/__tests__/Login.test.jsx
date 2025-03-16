import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import * as router from 'react-router-dom';
import Login from '../src/pages/Login';

/**
 * Mock the React Router hooks and components
 * This allows us to control navigation behavior in tests
 */
jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    useNavigate: jest.fn(),
    // eslint-disable-next-line react/prop-types
    Link: ({ children, to }) => <a href={to}>{children}</a>
  };
});

/**
 * Test Suite for Login Component
 * 
 * These tests verify that:
 * 1. The login form renders correctly with all required elements
 * 2. Error messages display on failed login attempts
 * 3. Successful login redirects the user and stores the token
 */
describe('Login Component', () => {
  // Shared variables
  let mockNavigate;
  let fetchMock;
  
  // Setup before each test
  beforeEach(() => {
    // Mock timers for faster execution
    jest.useFakeTimers();
    
    // Setup navigate mock
    mockNavigate = jest.fn();
    router.useNavigate.mockImplementation(() => mockNavigate);
    
    // Setup fetch mock with immediate resolution (using standardized response format)
    fetchMock = jest.fn().mockImplementation(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          message: 'Login successful',
          data: {
            token: 'fake-token',
            user: { id: '123', username: 'testuser', email: 'test@example.com' }
          }
        })
      })
    );
    window.fetch = fetchMock;
    
    // Mock localStorage
    Storage.prototype.getItem = jest.fn();
    Storage.prototype.setItem = jest.fn();
    
    // Silence console errors
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });
  
  // Clean up after each test
  afterEach(() => {
    // Restore all mocks
    jest.clearAllMocks();
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  // Test cases
  
  test('renders login form with all required elements', () => {
    render(<Login />);
    
    // These assertions are simple DOM checks and should be very fast
    expect(screen.getByText(/Login and start Blabbering/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  test('displays error message on login failure', async () => {
    // Override the fetch mock for this specific test
    fetchMock.mockImplementationOnce(() => 
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ 
          success: false, 
          message: 'Invalid credentials'
        })
      })
    );

    render(<Login />);
    
    // Fill out the form
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    
    // Fast-forward timers
    jest.runAllTimers();

    // Verify error message appears
    await waitFor(() => {
      expect(screen.getByText(/Invalid credentials/i)).toBeInTheDocument();
    });
    
    // Verify we didn't navigate away
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test('redirects on successful login and stores token', async () => {
    render(<Login />);
    
    // Fill out the form
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    
    // Fast-forward timers
    jest.runAllTimers();

    // Verify token is stored and navigation occurs
    await waitFor(() => {
      expect(localStorage.setItem).toHaveBeenCalledWith('token', 'fake-token');
      expect(localStorage.setItem).toHaveBeenCalledWith('userId', '123');
      expect(localStorage.setItem).toHaveBeenCalledWith('username', 'testuser');
      expect(mockNavigate).toHaveBeenCalledWith('/chat');
    });
  });
});

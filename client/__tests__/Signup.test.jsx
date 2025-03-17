import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import * as router from 'react-router-dom';
import Signup from '../src/pages/Signup';

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
 * Test Suite for Signup Component
 * 
 * These tests verify that:
 * 1. The signup form renders with all required elements
 * 2. Form validation works correctly for password matching
 * 3. Error messages display on failed registration attempts
 * 4. Successful registration redirects to login page
 */
describe('Signup Component', () => {
  // Shared variables
  let mockNavigate;
  let fetchMock;
  
  // Setup before each test
  beforeEach(() => {
    // Setup navigate mock
    mockNavigate = jest.fn();
    router.useNavigate.mockImplementation(() => mockNavigate);
    
    // Setup fetch mock with immediate resolution
    fetchMock = jest.fn().mockImplementation(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          message: 'User registered successfully',
          data: { 
            id: '123', 
            username: 'testuser', 
            firstName: 'Test', 
            lastName: 'User',
            email: 'test@example.com' 
          }
        })
      })
    );
    window.fetch = fetchMock;
    
    // Silence console errors
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });
  
  // Clean up after each test
  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  // Test cases
  test('renders signup form with all required elements', () => {
    render(<Signup />);
    
    expect(screen.getByText(/Create your Blab account/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i).closest('.password-input-container').querySelector('input')).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i).closest('.password-input-container').querySelector('input')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
  });
  
  test('shows error when passwords do not match', async () => {
    render(<Signup />);
    
    // Fill out the form with mismatched passwords
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: 'Test' } });
    fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: 'User' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    const passwordInput = screen.getByLabelText(/^password$/i).closest('.password-input-container').querySelector('input');
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i).closest('.password-input-container').querySelector('input');
    fireEvent.change(confirmPasswordInput, { target: { value: 'password456' } });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    });
    
    // Verify we didn't try to submit
    expect(window.fetch).not.toHaveBeenCalled();
  });
  
  test('displays error on failed registration', async () => {
    // Override the fetch mock for this specific test
    fetchMock.mockImplementationOnce(() => 
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({
          success: false,
          message: 'Email already in use'
        })
      })
    );
    
    render(<Signup />);
    
    // Fill out the form
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: 'Test' } });
    fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: 'User' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    const passwordInput = screen.getByLabelText(/^password$/i).closest('.password-input-container').querySelector('input');
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i).closest('.password-input-container').querySelector('input');
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/Email already in use/i)).toBeInTheDocument();
    });
    
    // Verify we didn't navigate away
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test('redirects to login page on successful registration', async () => {
    render(<Signup />);
    
    // Fill out the form
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: 'Test' } });
    fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: 'User' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    const passwordInput = screen.getByLabelText(/^password$/i).closest('.password-input-container').querySelector('input');
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i).closest('.password-input-container').querySelector('input');
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));
    
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
    
    // Verify we sent the firstName and lastName in the request
    expect(fetchMock).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
      method: 'POST',
      body: expect.stringContaining('firstName')
    }));
  });
}); 
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import * as router from 'react-router-dom';
import Profile from '../src/pages/Profile';

/**
 * Mock the React Router hooks and components
 * This allows us to control navigation behavior in tests
 */
jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    useNavigate: jest.fn(),
  };
});

/**
 * Test Suite for Profile Component
 * 
 * These tests verify that:
 * 1. The profile form renders with all required elements
 * 2. Error messages display on failed update attempts
 * 3. Success message displays on successful update
 * 4. Navigation works when clicking the back button
 */
describe('Profile Component', () => {
  // Shared variables
  let mockNavigate;
  let fetchMock;
  
  // Setup before each test
  beforeEach(() => {
    // Setup localStorage mock
    Storage.prototype.getItem = jest.fn(() => 'fake-token');
    
    // Setup navigate mock
    mockNavigate = jest.fn();
    router.useNavigate.mockImplementation(() => mockNavigate);
    
    // Setup fetch mock for /api/auth/me endpoint
    fetchMock = jest.fn()
      // First call is for the /me endpoint
      .mockImplementationOnce(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            data: {
              user: {
                id: '123',
                username: 'testuser',
                firstName: 'Test',
                lastName: 'User',
                email: 'test@example.com'
              }
            }
          })
        })
      )
      // Second call is for the profile update endpoint
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            message: 'Profile updated successfully',
            data: {
              user: {
                id: '123',
                username: 'testuser',
                firstName: 'Updated',
                lastName: 'Name',
                email: 'test@example.com'
              }
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

  test('renders profile form with all required elements and user data', async () => {
    render(<Profile />);
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText(/Update Your Profile/i)).toBeInTheDocument();
    });
    
    expect(screen.getByLabelText(/first name/i)).toHaveValue('Test');
    expect(screen.getByLabelText(/last name/i)).toHaveValue('User');
    expect(screen.getByRole('button', { name: /update profile/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /back to chat/i })).toBeInTheDocument();
  });
  
  test('shows success message when profile is updated successfully', async () => {
    render(<Profile />);
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    });
    
    // Change form values
    fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: 'Updated' } });
    fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: 'Name' } });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /update profile/i }));
    
    // Wait for success message
    await waitFor(() => {
      expect(screen.getByText(/Profile updated successfully/i)).toBeInTheDocument();
    });
    
    // Verify the API was called with the correct data
    expect(fetchMock).toHaveBeenCalledWith('/api/auth/profile', expect.objectContaining({
      method: 'PUT',
      body: JSON.stringify({
        firstName: 'Updated',
        lastName: 'Name'
      })
    }));
  });
  
  test('shows error message when update fails', async () => {
    // Override fetch for this test to return an error response
    fetchMock.mockReset();
    fetchMock
      // First call for /me still succeeds
      .mockImplementationOnce(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            data: {
              user: {
                id: '123',
                username: 'testuser',
                firstName: 'Test',
                lastName: 'User',
                email: 'test@example.com'
              }
            }
          })
        })
      )
      // Second call for update fails
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: false,
          json: () => Promise.resolve({
            success: false,
            message: 'Failed to update profile'
          })
        })
      );
    
    render(<Profile />);
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    });
    
    // Submit the form without changing values
    fireEvent.click(screen.getByRole('button', { name: /update profile/i }));
    
    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText(/Failed to update profile/i)).toBeInTheDocument();
    });
  });
  
  test('navigates to chat when back button is clicked', async () => {
    render(<Profile />);
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /back to chat/i })).toBeInTheDocument();
    });
    
    // Click back button
    fireEvent.click(screen.getByRole('button', { name: /back to chat/i }));
    
    // Verify navigation
    expect(mockNavigate).toHaveBeenCalledWith('/chat');
  });
  
  test('redirects to login if no token is found', async () => {
    // Create a separate mock for this test case
    const getItemMock = jest.fn().mockReturnValue(null);
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: getItemMock
      },
      writable: true
    });
    
    render(<Profile />);
    
    // Wait for the navigation to occur with a longer timeout
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    }, { timeout: 3000 });
  });
}); 
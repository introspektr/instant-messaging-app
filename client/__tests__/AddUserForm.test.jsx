import { render, screen, fireEvent } from '@testing-library/react';
import AddUserForm from '../src/components/AddUserForm';

/**
 * Test suite for the AddUserForm component
 * 
 * This component allows room creators to add users to a chat room.
 * It passes all input values to the parent component for validation.
 */
describe('AddUserForm Component', () => {
  // Test that component doesn't render when user is not the creator
  test('does not render when isCreator is false', () => {
    render(<AddUserForm onAddUser={() => {}} isCreator={false} />);
    const addButton = screen.queryByText('Add User');
    expect(addButton).not.toBeInTheDocument();
  });

  // Test initial state when isCreator is true
  test('renders add user button when isCreator is true', () => {
    render(<AddUserForm onAddUser={() => {}} isCreator={true} />);
    const addButton = screen.getByText('Add User');
    expect(addButton).toBeInTheDocument();
  });

  // Test form display when button is clicked
  test('shows form when add user button is clicked', () => {
    render(<AddUserForm onAddUser={() => {}} isCreator={true} />);
    
    // Click the "Add User" button
    fireEvent.click(screen.getByText('Add User'));
    
    // Check that form is displayed
    expect(screen.getByPlaceholderText('Enter username')).toBeInTheDocument();
    expect(screen.getByText('Add')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  // Test form cancellation
  test('hides form when cancel button is clicked', () => {
    render(<AddUserForm onAddUser={() => {}} isCreator={true} />);
    
    // Click the "Add User" button to show form
    fireEvent.click(screen.getByText('Add User'));
    
    // Click the "Cancel" button
    fireEvent.click(screen.getByText('Cancel'));
    
    // Check that form is hidden and add button is shown again
    expect(screen.queryByPlaceholderText('Enter username')).not.toBeInTheDocument();
    expect(screen.getByText('Add User')).toBeInTheDocument();
  });

  // Test form submission with valid input
  test('calls onAddUser with username and resets form on valid submission', () => {
    const mockAddUser = jest.fn();
    render(<AddUserForm onAddUser={mockAddUser} isCreator={true} />);
    
    // Click the "Add User" button to show form
    fireEvent.click(screen.getByText('Add User'));
    
    // Type a username
    const input = screen.getByPlaceholderText('Enter username');
    fireEvent.change(input, { target: { value: 'newuser' } });
    
    // Submit the form
    fireEvent.submit(screen.getByRole('form'));
    
    // Check that onAddUser was called with the correct username
    expect(mockAddUser).toHaveBeenCalledWith('newuser');
    
    // Check that form is reset and hidden
    expect(screen.queryByPlaceholderText('Enter username')).not.toBeInTheDocument();
    expect(screen.getByText('Add User')).toBeInTheDocument();
  });
  
  // Test form submission with empty input
  test('calls onAddUser with empty username and keeps form open', () => {
    const mockAddUser = jest.fn();
    render(<AddUserForm onAddUser={mockAddUser} isCreator={true} />);
    
    // Click the "Add User" button to show form
    fireEvent.click(screen.getByText('Add User'));
    
    // Submit the form without entering a username
    fireEvent.submit(screen.getByRole('form'));
    
    // Check that onAddUser was called with empty string
    expect(mockAddUser).toHaveBeenCalledWith('');
    
    // Check that form is still open (not reset or hidden)
    expect(screen.getByPlaceholderText('Enter username')).toBeInTheDocument();
    expect(screen.queryByText('Add User')).not.toBeInTheDocument();
  });
  
  // Test form submission with whitespace-only input
  test('calls onAddUser with whitespace username and keeps form open', () => {
    const mockAddUser = jest.fn();
    render(<AddUserForm onAddUser={mockAddUser} isCreator={true} />);
    
    // Click the "Add User" button to show form
    fireEvent.click(screen.getByText('Add User'));
    
    // Type spaces in the input
    const input = screen.getByPlaceholderText('Enter username');
    fireEvent.change(input, { target: { value: '   ' } });
    
    // Submit the form
    fireEvent.submit(screen.getByRole('form'));
    
    // Check that onAddUser was called with whitespace
    expect(mockAddUser).toHaveBeenCalledWith('   ');
    
    // Check that form is still open and input value is preserved
    expect(screen.getByPlaceholderText('Enter username')).toBeInTheDocument();
    expect(input.value).toBe('   ');
    expect(screen.queryByText('Add User')).not.toBeInTheDocument();
  });
}); 
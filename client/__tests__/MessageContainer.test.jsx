import { render, screen, fireEvent } from '@testing-library/react';
import MessageContainer from '../src/components/MessageContainer';

/**
 * Mock the scrollIntoView method which is not available in the test environment
 * This prevents errors when the component tries to scroll to the bottom
 */
Element.prototype.scrollIntoView = jest.fn();

/**
 * Test Suite for MessageContainer Component
 * 
 * These tests verify that:
 * 1. An empty state message is displayed when there are no messages
 * 2. Messages render correctly with sender and content
 * 3. Delete buttons appear when the onDelete prop is provided
 */
describe('MessageContainer Component', () => {
  // Sample message data for testing
  const mockMessages = [
    { _id: '1', content: 'Hello world', sender: { username: 'user1' } },
    { _id: '2', content: 'How are you?', sender: { username: 'user2' } }
  ];

  // Setup before each test
  beforeEach(() => {
    // Reset mock implementations
    jest.clearAllMocks();
  });

  test('renders empty state message when no messages are present', () => {
    render(<MessageContainer messages={[]} />);
    
    // Verify empty state message is displayed
    expect(screen.getByText(/No messages yet/i)).toBeInTheDocument();
  });

  test('renders messages with correct content and sender information', () => {
    render(<MessageContainer messages={mockMessages} />);
    
    // Verify message content
    expect(screen.getByText(/Hello world/i)).toBeInTheDocument();
    expect(screen.getByText(/How are you?/i)).toBeInTheDocument();
    
    // Verify sender information
    expect(screen.getByText(/user1:/i)).toBeInTheDocument();
    expect(screen.getByText(/user2:/i)).toBeInTheDocument();
  });

  test('shows delete buttons when onDelete prop is provided', () => {
    // Create mock function for delete action
    const mockOnDelete = jest.fn();
    
    render(<MessageContainer messages={mockMessages} onDelete={mockOnDelete} />);
    
    // Verify delete buttons are present
    const deleteButtons = screen.getAllByTitle('Delete message');
    expect(deleteButtons.length).toBe(mockMessages.length);
    
    // Verify delete function is called with the correct ID
    fireEvent.click(deleteButtons[0]);
    expect(mockOnDelete).toHaveBeenCalledWith('1');
  });
});

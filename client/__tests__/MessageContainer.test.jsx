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
 * 4. Full names are displayed correctly when available
 */
describe('MessageContainer Component', () => {
  // Sample message data for testing
  const mockMessages = [
    { _id: '1', content: 'Hello world', sender: { username: 'user1' } },
    { _id: '2', content: 'How are you?', sender: { username: 'user2' } }
  ];

  // Sample messages with full names
  const mockMessagesWithNames = [
    { 
      _id: '3', 
      content: 'Message with full name', 
      sender: { 
        username: 'user3',
        firstName: 'John',
        lastName: 'Doe'
      } 
    },
    { 
      _id: '4', 
      content: 'Message with first name only', 
      sender: { 
        username: 'user4',
        firstName: 'Jane',
        lastName: ''
      } 
    },
    { 
      _id: '5', 
      content: 'Message with last name only', 
      sender: { 
        username: 'user5',
        firstName: '',
        lastName: 'Smith'
      } 
    }
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

  test('displays full name when firstName and lastName are available', () => {
    render(<MessageContainer messages={[mockMessagesWithNames[0]]} />);
    
    // Verify the message displays the full name
    expect(screen.getByText(/John Doe:/i)).toBeInTheDocument();
    expect(screen.getByText(/Message with full name/i)).toBeInTheDocument();
  });

  test('displays first name only when lastName is not available', () => {
    render(<MessageContainer messages={[mockMessagesWithNames[1]]} />);
    
    // Verify the message displays just the first name
    expect(screen.getByText(/Jane:/i)).toBeInTheDocument();
    expect(screen.getByText(/Message with first name only/i)).toBeInTheDocument();
  });

  test('displays last name only when firstName is not available', () => {
    render(<MessageContainer messages={[mockMessagesWithNames[2]]} />);
    
    // Verify the message displays just the last name
    expect(screen.getByText(/Smith:/i)).toBeInTheDocument();
    expect(screen.getByText(/Message with last name only/i)).toBeInTheDocument();
  });
});

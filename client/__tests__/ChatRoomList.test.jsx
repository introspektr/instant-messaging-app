import { render, screen, fireEvent } from '@testing-library/react';
import ChatRoomList from '../src/components/ChatRoomList';

/**
 * Test suite for the ChatRoomList component
 * 
 * This component displays a list of chat rooms and allows users to select one.
 */
describe('ChatRoomList Component', () => {
  // Sample data for testing
  const mockRooms = [
    { _id: '123', name: 'General' },
    { _id: '456', name: 'Random' },
    { _id: '789', name: 'Help' }
  ];
  
  // Test basic rendering
  test('renders the list of rooms', () => {
    render(<ChatRoomList rooms={mockRooms} onSelectRoom={() => {}} />);
    
    // Check if header is displayed
    expect(screen.getByText('Text Channels')).toBeInTheDocument();
    
    // Check if all room names are displayed
    expect(screen.getByText('General')).toBeInTheDocument();
    expect(screen.getByText('Random')).toBeInTheDocument();
    expect(screen.getByText('Help')).toBeInTheDocument();
  });
  
  // Test room selection
  test('calls onSelectRoom with the room ID when clicking a room', () => {
    const mockSelectRoom = jest.fn();
    render(<ChatRoomList rooms={mockRooms} onSelectRoom={mockSelectRoom} />);
    
    // Click on the "Random" room
    fireEvent.click(screen.getByText('Random'));
    
    // Check if onSelectRoom was called with the correct ID
    expect(mockSelectRoom).toHaveBeenCalledWith('456');
  });
  
  // Test active room highlighting
  test('applies active class to the currently selected room', () => {
    const { container } = render(
      <ChatRoomList rooms={mockRooms} onSelectRoom={() => {}} currentRoom="456" />
    );
    
    // Get all room list items
    const roomItems = container.querySelectorAll('li');
    
    // Check that the second room has the 'active' class
    expect(roomItems[1]).toHaveClass('active');
    
    // Check that other rooms don't have the 'active' class
    expect(roomItems[0]).not.toHaveClass('active');
    expect(roomItems[2]).not.toHaveClass('active');
  });
  
  // Test rendering with empty rooms array
  test('renders empty list when no rooms are provided', () => {
    render(<ChatRoomList rooms={[]} onSelectRoom={() => {}} />);
    
    // Header should still be visible
    expect(screen.getByText('Text Channels')).toBeInTheDocument();
    
    // There should be no list items
    const listItems = screen.queryAllByRole('listitem');
    expect(listItems.length).toBe(0);
  });
}); 
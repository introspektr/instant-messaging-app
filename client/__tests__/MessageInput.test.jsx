import { render, screen, fireEvent } from '../src/test-helpers/test-utils';
import MessageInput from '../src/components/MessageInput';

/**
 * Test Suite for MessageInput Component
 * 
 * These tests verify that:
 * 1. The component renders correctly with input field and button
 * 2. The input field updates when a user types
 * 3. The form submits the message and clears the input after submission
 * 4. The component passes empty messages to parent for validation
 * 5. The component doesn't clear the input field for empty submissions
 */
describe('MessageInput Component', () => {
  // Test case: Verify the component renders all expected elements
  test('renders input and submit button', () => {
    // Render the component with an empty callback function
    render(<MessageInput onSendMessage={() => {}} />);
    
    // Verify the input field exists (using its placeholder text to find it)
    expect(screen.getByPlaceholderText('Type a message...')).toBeInTheDocument();
    
    // Verify the button exists (using its text content and role)
    expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument();
  });

  // Test case: Verify the input field updates when user types
  test('updates input value when typing', () => {
    // Render the component
    render(<MessageInput onSendMessage={() => {}} />);
    
    // Get the input field
    const input = screen.getByPlaceholderText('Type a message...');
    
    // Simulate a user typing in the input
    fireEvent.change(input, { target: { value: 'Hello world' } });
    
    // Verify the input value has been updated correctly
    expect(input.value).toBe('Hello world');
  });

  // Test case: Verify the form submission behavior
  test('calls onSendMessage with message value when form is submitted', () => {
    // Create a mock function to track if and how it's called
    const mockSendMessage = jest.fn();
    
    // Render the component with our mock function
    render(<MessageInput onSendMessage={mockSendMessage} />);
    
    // Get the input field
    const input = screen.getByPlaceholderText('Type a message...');
    
    // Simulate typing in the input
    fireEvent.change(input, { target: { value: 'Test message' } });
    
    // Simulate form submission
    fireEvent.submit(screen.getByRole('form'));
    
    // Verify the mockSendMessage function was called with the correct message
    expect(mockSendMessage).toHaveBeenCalledWith('Test message');
    
    // Verify the input was cleared after submission (empty string)
    expect(input.value).toBe('');
  });
  
  // Test case: Verify empty submissions are passed to parent for validation
  test('calls onSendMessage when submitting empty message', () => {
    // Create a mock function to track if and how it's called
    const mockSendMessage = jest.fn();
    
    // Render the component with our mock function
    render(<MessageInput onSendMessage={mockSendMessage} />);
    
    // Get the form element
    const form = screen.getByRole('form');
    
    // Simulate form submission with empty input (default state)
    fireEvent.submit(form);
    
    // Verify the mockSendMessage function WAS called with empty string
    // Parent component will handle validation and toast messages
    expect(mockSendMessage).toHaveBeenCalledWith('');
    
    // Verify the input remains empty (wasn't cleared since it was already empty)
    const input = screen.getByPlaceholderText('Type a message...');
    expect(input.value).toBe('');
  });
  
  // Test case: Verify whitespace-only messages are passed to parent for validation
  test('calls onSendMessage when submitting whitespace-only message', () => {
    // Create a mock function to track if and how it's called
    const mockSendMessage = jest.fn();
    
    // Render the component with our mock function
    render(<MessageInput onSendMessage={mockSendMessage} />);
    
    // Get the input field
    const input = screen.getByPlaceholderText('Type a message...');
    
    // Simulate typing spaces in the input
    fireEvent.change(input, { target: { value: '   ' } });
    
    // Simulate form submission
    fireEvent.submit(screen.getByRole('form'));
    
    // Verify the mockSendMessage function WAS called with whitespace
    // Parent component will handle validation and toast messages
    expect(mockSendMessage).toHaveBeenCalledWith('   ');
    
    // Verify the input wasn't cleared (since it contains only whitespace)
    expect(input.value).toBe('   ');
  });
  
  // Test case: Verify input is not cleared for empty submissions
  test('does not clear input when submitting empty message', () => {
    // Create a mock function to track if and how it's called
    const mockSendMessage = jest.fn();
    
    // Render the component with our mock function
    render(<MessageInput onSendMessage={mockSendMessage} />);
    
    // Get the input field
    const input = screen.getByPlaceholderText('Type a message...');
    
    // Simulate typing spaces in the input
    fireEvent.change(input, { target: { value: '   ' } });
    
    // Simulate form submission
    fireEvent.submit(screen.getByRole('form'));
    
    // Verify the input wasn't cleared (since it contains only whitespace)
    expect(input.value).toBe('   ');
  });
}); 
import { render, screen, fireEvent } from '@testing-library/react';
import Toast from '../src/components/Toast';

/**
 * Test Suite for Toast Component
 * 
 * These tests verify that:
 * 1. The toast renders with the correct message and type
 * 2. The close button functions correctly
 * 3. The toast auto-closes after the specified duration
 */
describe('Toast Component', () => {
  // Setup before each test
  beforeEach(() => {
    // Mock timers for testing auto-close functionality
    jest.useFakeTimers();
  });
  
  // Clean up after each test
  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  test('renders with the provided message and type', () => {
    const mockOnClose = jest.fn();
    
    render(
      <Toast 
        message="Test notification" 
        type="info" 
        onClose={mockOnClose} 
        duration={3000} 
      />
    );
    
    // Verify the toast content
    expect(screen.getByText('Test notification')).toBeInTheDocument();
    
    // Verify the toast has the correct CSS class
    const toastElement = screen.getByText('Test notification').closest('.toast');
    expect(toastElement).toHaveClass('info');
  });
  
  test('calls onClose when close button is clicked', () => {
    const mockOnClose = jest.fn();
    
    render(
      <Toast 
        message="Test notification" 
        type="info" 
        onClose={mockOnClose} 
        duration={3000} 
      />
    );
    
    // Click the close button
    fireEvent.click(screen.getByRole('button'));
    
    // Verify onClose was called
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
  
  test('auto-closes after the specified duration', () => {
    const mockOnClose = jest.fn();
    
    render(
      <Toast 
        message="Test notification" 
        type="info" 
        onClose={mockOnClose} 
        duration={3000} 
      />
    );
    
    // Verify onClose hasn't been called yet
    expect(mockOnClose).not.toHaveBeenCalled();
    
    // Fast-forward time by the duration
    jest.advanceTimersByTime(3000);
    
    // Verify onClose was called
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});

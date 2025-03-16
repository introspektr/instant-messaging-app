import { renderHook, act } from '@testing-library/react';
import ToastContainer from '../src/components/ToastContainer';

/**
 * Test suite for the ToastContainer component
 * 
 * This component manages toast notifications in the application.
 */
describe('ToastContainer Component', () => {
  // Test that the component returns the expected functions and elements
  test('returns toastElements, addToast, and removeToast', () => {
    // Render the hook
    const { result } = renderHook(() => ToastContainer());
    
    // Check that the hook returns the expected properties
    expect(result.current).toHaveProperty('toastElements');
    expect(result.current).toHaveProperty('addToast');
    expect(result.current).toHaveProperty('removeToast');
    expect(typeof result.current.addToast).toBe('function');
    expect(typeof result.current.removeToast).toBe('function');
  });
  
  // Test that addToast adds a toast to the state
  test('addToast adds a toast to the state', () => {
    // Render the hook
    const { result } = renderHook(() => ToastContainer());
    
    // Add a toast
    act(() => {
      result.current.addToast('Test toast message');
    });
    
    // Check that the toast was added to the DOM
    const toastElements = result.current.toastElements;
    expect(toastElements.props.children.length).toBe(1);
    expect(toastElements.props.children[0].props.message).toBe('Test toast message');
    expect(toastElements.props.children[0].props.type).toBe('info'); // Default type
  });
  
  // Test that removeToast removes a toast from the state
  test('removeToast removes a toast from the state', () => {
    // Render the hook
    const { result } = renderHook(() => ToastContainer());
    
    let toastId;
    
    // Add a toast and capture its ID
    act(() => {
      toastId = result.current.addToast('Test toast message');
    });
    
    // Verify toast was added
    expect(result.current.toastElements.props.children.length).toBe(1);
    
    // Remove the toast
    act(() => {
      result.current.removeToast(toastId);
    });
    
    // Check that the toast was removed
    expect(result.current.toastElements.props.children.length).toBe(0);
  });
}); 
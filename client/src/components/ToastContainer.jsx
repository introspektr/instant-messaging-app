import { useState, useCallback } from 'react';
import Toast from './Toast';
import '../styles/Toast.css';

// Create a unique ID for each toast
let toastId = 0;

/**
 * ToastContainer Component
 * 
 * This component manages the toast notifications in the application.
 * It provides methods to add and remove toast notifications and renders
 * all active toasts in a container.
 * 
 * This component works like a custom hook - it returns an object with:
 * - toastElements: The JSX element containing all current toasts
 * - addToast: Function to add a new toast
 * - removeToast: Function to remove a toast by ID
 * 
 * @returns {Object} An object containing toast elements and control functions
 */
const ToastContainer = () => {
    // State to track all active toast notifications
    const [toasts, setToasts] = useState([]);

    /**
     * Add a new toast notification
     * 
     * @param {string} message - The message to display in the toast
     * @param {string} [type='info'] - Type of toast (success, error, info)
     * @param {number} [duration=3000] - Time in ms before the toast auto-dismisses
     * @returns {number} The ID of the newly created toast
     */
    const addToast = useCallback((message, type = 'info', duration = 3000) => {
        const id = toastId++; // Generate a unique ID for this toast
        // Update the toasts state by adding the new toast to the array
        setToasts(prevToasts => [...prevToasts, { id, message, type, duration }]);
        return id; // Return the ID so it can be used to remove this toast later
    }, []);

    /**
     * Remove a toast notification by ID
     * 
     * @param {number} id - The ID of the toast to remove
     */
    const removeToast = useCallback((id) => {
        // Update the toasts state by filtering out the toast with the specified ID
        setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
    }, []);

    // Return an object with the toast elements and control functions
    return {
        // JSX element containing all current toasts
        toastElements: (
            <div className="toast-container" aria-live="polite" aria-atomic="true">
                {toasts.map(toast => (
                    <Toast
                        key={toast.id}
                        message={toast.message}
                        type={toast.type}
                        duration={toast.duration}
                        onClose={() => removeToast(toast.id)}
                    />
                ))}
            </div>
        ),
        addToast,    // Function to add a new toast
        removeToast  // Function to remove a toast
    };
};

export default ToastContainer; 
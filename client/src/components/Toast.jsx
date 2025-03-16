import { useEffect, memo } from 'react';
import PropTypes from 'prop-types';
import '../styles/Toast.css';

/**
 * Toast Component
 * 
 * This component displays a toast notification message with auto-dismissal.
 * It supports different types of toast (success, error, info) and auto-dismisses
 * after a specified duration.
 * 
 * @param {Object} props - Component props
 * @param {string} props.message - The message to display in the toast
 * @param {string} props.type - Type of toast (success, error, info)
 * @param {Function} props.onClose - Callback function to execute when toast is closed
 * @param {number} [props.duration=3000] - Time in ms before the toast auto-dismisses
 */
const Toast = ({ message, type, onClose, duration = 3000 }) => {
    // Effect to auto-dismiss the toast after 'duration' milliseconds
    useEffect(() => {
        // Set a timer to auto-dismiss the toast
        const timer = setTimeout(() => {
            onClose(); // Call the close function when timer expires
        }, duration);

        // Cleanup function to clear the timer if component unmounts
        return () => clearTimeout(timer);
    }, [duration, onClose]); // Dependencies for the effect

    // Get appropriate aria role based on toast type
    const getAriaRole = () => {
        switch (type) {
            case 'error':
                return 'alert';
            case 'success':
            case 'info':
            default:
                return 'status';
        }
    };

    return (
        <div 
            className={`toast ${type}`}
            role={getAriaRole()}
            aria-live={type === 'error' ? 'assertive' : 'polite'}
        >
            <div className="toast-content">
                <span>{message}</span>
            </div>
            <button 
                className="toast-close" 
                onClick={onClose}
                aria-label="Close notification"
                title="Close"
            >
                ×
            </button>
        </div>
    );
};

// PropTypes for type-checking the component props
Toast.propTypes = {
    message: PropTypes.string.isRequired,
    type: PropTypes.oneOf(['success', 'error', 'info']).isRequired,
    onClose: PropTypes.func.isRequired,
    duration: PropTypes.number
};

// Using memo to prevent unnecessary re-renders
export default memo(Toast); 
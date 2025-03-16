import { useState } from 'react';
import PropTypes from 'prop-types';

/**
 * MessageInput Component
 * 
 * This component creates a form with a text input and submit button that allows users
 * to type and send chat messages.
 * 
 * @param {Object} props - Component props
 * @param {Function} props.onSendMessage - Callback function that is called when a message is submitted
 *                                        The parent component will handle actually sending the message
 */
const MessageInput = ({ onSendMessage }) => {
    // Create a state variable 'message' with initial value of empty string
    // setMessage is the function we'll use to update this state
    const [message, setMessage] = useState('');

    /**
     * Handle form submission
     * This function is called when the user submits the form
     * 
     * @param {Event} e - The form submission event
     */
    const handleSubmit = (e) => {
        e.preventDefault(); // Prevent the default browser form submission behavior which would refresh the page
        
        // Always call onSendMessage, even with empty message
        // The parent component will handle validation and toast messages
        onSendMessage(message);
        
        // Only clear the input if the message is not empty
        if (message.trim()) {
            setMessage(''); // Clear the input field after sending
        }
    };

    return (
        <form className="message-input" onSubmit={handleSubmit} role="form">
            {/* Text input for the message */}
            <input
                type="text"
                value={message} // Controlled input - React manages the input's state
                onChange={(e) => setMessage(e.target.value)} // Update state when user types
                placeholder="Type a message..."
                aria-label="Message content" // Accessibility label
            />
            {/* Submit button */}
            <button type="submit">Send</button>
        </form>
    );
};

// PropTypes ensure that the component receives the correct prop types
// This helps catch bugs early during development
MessageInput.propTypes = {
    onSendMessage: PropTypes.func.isRequired, // This prop must be a function and is required
};

export default MessageInput; // Export the component so it can be imported elsewhere 
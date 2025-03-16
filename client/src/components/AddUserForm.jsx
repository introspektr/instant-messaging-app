import { useState, memo } from 'react';
import PropTypes from 'prop-types';

/**
 * AddUserForm Component
 * 
 * This component provides a UI for chat room creators to add new users to a room.
 * It shows either an "Add User" button or a form with input field and action buttons,
 * depending on the current state.
 * 
 * @param {Object} props - Component props
 * @param {Function} props.onAddUser - Callback function that will be called with the username when adding a user
 * @param {boolean} props.isCreator - Flag that determines if the current user is the room creator
 *                                   Only room creators can add users, so this controls visibility
 */
const AddUserForm = ({ onAddUser, isCreator }) => {
    // State for the username input field
    const [username, setUsername] = useState('');
    
    // State to track whether we're showing the add form (true) or just the button (false)
    const [isAdding, setIsAdding] = useState(false);

    /**
     * Handle form submission
     * This function is called when the add user form is submitted
     * 
     * @param {Event} e - The form submission event
     */
    const handleSubmit = (e) => {
        e.preventDefault(); // Prevent the default browser form submission behavior
        
        // Always call onAddUser, even with empty username
        // The parent component will handle validation and toast messages
        onAddUser(username);
        
        // Only reset the form if the username is not empty
        if (username.trim()) {
            setUsername(''); // Reset the input field
            setIsAdding(false); // Hide the form after submission
        }
    };

    // Early return pattern: if user is not the creator, don't render anything
    if (!isCreator) return null;

    return (
        <div className="add-user-container">
            {/* Conditional rendering based on isAdding state */}
            {!isAdding ? (
                // When not in "adding" mode, show the "Add User" button
                <button 
                    className="add-user-button"
                    onClick={() => setIsAdding(true)} // Switch to form display when clicked
                >
                    Add User
                </button>
            ) : (
                // When in "adding" mode, show the form
                <form onSubmit={handleSubmit} className="add-user-form" role="form">
                    {/* Username input field */}
                    <input
                        type="text"
                        value={username} // Controlled input - React manages the input's state
                        onChange={(e) => setUsername(e.target.value)} // Update state when user types
                        placeholder="Enter username"
                        className="add-user-input"
                    />
                    <div className="add-user-actions">
                        {/* Submit button to add the user */}
                        <button type="submit" className="confirm-add-button">
                            Add
                        </button>
                        {/* Cancel button to hide the form */}
                        <button 
                            type="button" 
                            className="cancel-add-button"
                            onClick={() => {
                                setIsAdding(false); // Hide the form
                                setUsername(''); // Clear the input
                            }}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};

// PropTypes for type-checking the component props
AddUserForm.propTypes = {
    onAddUser: PropTypes.func.isRequired, // Function to call when adding a user
    isCreator: PropTypes.bool.isRequired  // Boolean flag indicating if user is creator
};

// Using memo to prevent unnecessary re-renders
// The component will only re-render if its props change
export default memo(AddUserForm); 
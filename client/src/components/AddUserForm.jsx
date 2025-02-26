import { useState, memo } from 'react';
import PropTypes from 'prop-types';

const AddUserForm = ({ onAddUser, isCreator }) => {
    const [username, setUsername] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (username.trim()) {
            onAddUser(username);
            setUsername('');
        }
    };

    if (!isCreator) return null;

    return (
        <div className="add-user-container">
            {!isAdding ? (
                <button 
                    className="add-user-button"
                    onClick={() => setIsAdding(true)}
                >
                    Add User
                </button>
            ) : (
                <form onSubmit={handleSubmit} className="add-user-form">
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Enter username"
                        className="add-user-input"
                    />
                    <div className="add-user-actions">
                        <button type="submit" className="confirm-add-button">
                            Add
                        </button>
                        <button 
                            type="button" 
                            className="cancel-add-button"
                            onClick={() => {
                                setIsAdding(false);
                                setUsername('');
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

AddUserForm.propTypes = {
    onAddUser: PropTypes.func.isRequired,
    isCreator: PropTypes.bool.isRequired
};

export default memo(AddUserForm); 
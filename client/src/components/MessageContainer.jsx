import PropTypes from 'prop-types';

const MessageContainer = ({ messages, currentUser, onDelete }) => {
    return (
        <div className="message-container">
            {messages.map((message) => (
                <div key={message.id} className="message">
                    <strong>{message.sender.username}</strong>: {message.content}
                    {message.userId === currentUser.id && (
                        <button 
                            className="delete-button" 
                            onClick={() => onDelete(message.id)}
                        >
                            Delete
                        </button>
                    )}
                </div>
            ))}
        </div>
    );
};

MessageContainer.propTypes = {
    messages: PropTypes.arrayOf(
        PropTypes.shape({
            user: PropTypes.string.isRequired,
            text: PropTypes.string.isRequired,
        })
    ).isRequired,
    currentUser: PropTypes.shape({
        id: PropTypes.string.isRequired,
    }).isRequired,
    onDelete: PropTypes.func.isRequired,
};

export default MessageContainer; 
import PropTypes from 'prop-types';

const MessageContainer = ({ messages, onDelete }) => {
    return (
        <div className="message-container">
            {messages.length === 0 ? (
                <p className="no-messages">No messages yet. Start the conversation!</p>
            ) : (
                messages.map((message, index) => {
                    // Handle different message formats
                    const messageId = message._id || message.id || index;
                    const messageContent = message.content || message.text || '';
                    const messageSender = 
                        (typeof message.sender === 'object' ? message.sender.username : message.sender) || 
                        message.user || 
                        'Unknown';
                    
                    return (
                        <div key={messageId} className="message">
                            <div className="message-content">
                                <strong>{messageSender}: </strong>
                                <span>{messageContent}</span>
                            </div>
                            {onDelete && (
                                <button 
                                    onClick={() => onDelete(messageId)} 
                                    className="delete-message-button"
                                    title="Delete message"
                                >
                                    🗑️
                                </button>
                            )}
                        </div>
                    );
                })
            )}
        </div>
    );
};

MessageContainer.propTypes = {
    messages: PropTypes.array.isRequired,
    onDelete: PropTypes.func
};

export default MessageContainer; 
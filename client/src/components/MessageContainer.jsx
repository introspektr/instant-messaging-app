import { memo } from 'react';
import PropTypes from 'prop-types';

const MessageContainer = ({ messages, onDelete }) => {
    return (
        <div className="message-container">
            {messages.length === 0 ? (
                <p className="no-messages">No messages yet. Start the conversation!</p>
            ) : (
                messages.map((message) => {
                    const senderName = message.sender?.username || 'Unknown';
                    return (
                        <div key={message._id} className="message">
                            <div className="message-content">
                                <strong>{senderName}: </strong>
                                <span>{message.content}</span>
                            </div>
                            {onDelete && (
                                <button 
                                    onClick={() => onDelete(message._id)} 
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

// Use memo to prevent re-renders when props haven't changed
export default memo(MessageContainer); 
import { memo, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import blabLogo from '../assets/blab-logo.svg';

/**
 * MessageContainer Component
 * 
 * This component displays a scrollable container of chat messages.
 * It automatically scrolls to the bottom when new messages are added.
 * It can optionally display delete buttons if the onDelete prop is provided.
 * 
 * @param {Object} props - Component props
 * @param {Array} props.messages - Array of message objects to display
 * @param {Function} [props.onDelete] - Optional callback function to handle message deletion
 */
const MessageContainer = ({ messages, onDelete }) => {
    const messagesEndRef = useRef(null);
    
    // Auto-scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    return (
        <div className="message-container">
            {/* Background logo */}
            <div className="background-logo-container">
                <img src={blabLogo} alt="" className="background-logo" />
            </div>
            
            {messages.length === 0 ? (
                <p className="no-messages">No messages yet. Start the conversation!</p>
            ) : (
                messages.map((message) => {
                    // Determine display name: full name if available, otherwise username
                    let senderName = message.sender?.username || 'Unknown';
                    
                    // Use full name if both firstName and lastName are available
                    if (message.sender?.firstName && message.sender?.lastName) {
                        senderName = `${message.sender.firstName} ${message.sender.lastName}`;
                    } 
                    // Use just firstName if only that is available
                    else if (message.sender?.firstName) {
                        senderName = message.sender.firstName;
                    }
                    // Use just lastName if only that is available
                    else if (message.sender?.lastName) {
                        senderName = message.sender.lastName;
                    }
                    
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
                                    aria-label={`Delete message from ${senderName}`}
                                >
                                    🗑️
                                </button>
                            )}
                        </div>
                    );
                })
            )}
            <div ref={messagesEndRef} />
        </div>
    );
};

MessageContainer.propTypes = {
    messages: PropTypes.arrayOf(
        PropTypes.shape({
            _id: PropTypes.string.isRequired,
            content: PropTypes.string.isRequired,
            sender: PropTypes.shape({
                username: PropTypes.string,
                firstName: PropTypes.string,
                lastName: PropTypes.string
            })
        })
    ).isRequired,
    onDelete: PropTypes.func
};

// Use memo to prevent re-renders when props haven't changed
export default memo(MessageContainer); 
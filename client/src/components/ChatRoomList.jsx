import { memo } from 'react';
import PropTypes from 'prop-types';

/**
 * ChatRoomList Component
 * 
 * This component displays a list of available chat rooms/channels.
 * It allows users to select a room to join, highlighting the currently active room.
 * 
 * @param {Object} props - Component props
 * @param {Array} props.rooms - Array of room objects to display
 * @param {Function} props.onSelectRoom - Callback function called when a room is selected
 * @param {string} [props.currentRoom] - ID of the currently active room (if any)
 */
const ChatRoomList = ({ rooms, onSelectRoom, currentRoom }) => {
    return (
        <div className="chat-room-list">
            <h3>Text Channels</h3>
            {/* Show "No channels" message if rooms array is empty */}
            {rooms.length === 0 ? (
                <p className="no-rooms-message">No channels available</p>
            ) : (
                <ul className="room-list">
                    {rooms.map((room) => (
                        <li 
                            key={room._id} 
                            onClick={() => onSelectRoom(room._id)}
                            className={currentRoom === room._id ? 'active' : ''}
                            aria-current={currentRoom === room._id ? 'true' : 'false'}
                            role="button"
                            tabIndex={0}
                            // Add keyboard accessibility
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    onSelectRoom(room._id);
                                }
                            }}
                        >
                            {room.name}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

// PropTypes for type-checking the component props
ChatRoomList.propTypes = {
    rooms: PropTypes.arrayOf(
        PropTypes.shape({
            _id: PropTypes.string.isRequired,
            name: PropTypes.string.isRequired,
        })
    ).isRequired,
    onSelectRoom: PropTypes.func.isRequired,
    currentRoom: PropTypes.string
};

// Using memo to prevent unnecessary re-renders
// The component will only re-render if its props change
export default memo(ChatRoomList); 
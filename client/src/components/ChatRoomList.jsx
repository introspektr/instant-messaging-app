import { memo } from 'react';
import PropTypes from 'prop-types';

const ChatRoomList = ({ rooms, onSelectRoom, currentRoom }) => {
    return (
        <div className="chat-room-list">
            <h3>Text Channels</h3>
            <ul>
                {rooms.map((room) => (
                    <li 
                        key={room._id} 
                        onClick={() => onSelectRoom(room._id)}
                        className={currentRoom === room._id ? 'active' : ''}
                    >
                        {room.name}
                    </li>
                ))}
            </ul>
        </div>
    );
};

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

export default memo(ChatRoomList); 
import PropTypes from 'prop-types';

const ChatRoomList = ({ rooms, onSelectRoom }) => {
    return (
        <div className="chat-room-list">
            <h3>Available Rooms</h3>
            <ul>
                {rooms.map((room) => (
                    <li key={room._id} onClick={() => onSelectRoom(room._id)}>
                        {room.name} (Created by: {room.createdBy.username})
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
};

export default ChatRoomList; 
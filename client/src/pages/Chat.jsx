import { useEffect, useState } from 'react';
import io from 'socket.io-client';
import ChatRoomList from '../components/ChatRoomList';
import MessageContainer from '../components/MessageContainer';
import MessageInput from '../components/MessageInput';
import { useNavigate } from 'react-router-dom';
import '../styles/Chat.css';

const socket = io('http://localhost:8747', {
    auth: {
        token: localStorage.getItem('token'), // Ensure the token is included
    },
});

const Chat = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [rooms, setRooms] = useState([]);
    const [messages, setMessages] = useState([]);
    const [newRoomName, setNewRoomName] = useState('');
    const [currentRoom, setCurrentRoom] = useState(null);
    const [participants, setParticipants] = useState([]);
    const currentUser = { id: 'currentUserId' }; // Example current user

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');

        if (!token || !userData) {
            navigate('/login');
            return;
        }

        const parsedUser = JSON.parse(userData);
        console.log('Current user:', parsedUser); // Debugging log
        setUser(parsedUser);

        socket.on('connect', () => {
            console.log('Connected to server');
        });

        socket.on('rooms', (availableRooms) => {
            console.log('Available rooms:', availableRooms); // Debugging log
            setRooms(availableRooms);
        });

        socket.on('message', (message) => {
            setMessages((prevMessages) => [...prevMessages, message]);
        });

        socket.on('error', (errorMessage) => {
            console.error('Socket error:', errorMessage);
            // Optionally, display the error to the user
        });

        socket.on('userJoined', ({ userId, message }) => {
            console.log(`User ${userId} joined: ${message}`);
            // Optionally update participants list
        });

        return () => {
            socket.disconnect();
        };
    }, [navigate]);

    useEffect(() => {
        socket.on('rooms', (availableRooms) => {
            setRooms(availableRooms);
        });

        socket.on('messages', (roomMessages) => {
            setMessages(roomMessages);
        });

        socket.on('roomDeleted', ({ roomId }) => {
            setRooms((prevRooms) => prevRooms.filter(room => room._id !== roomId));
            if (currentRoom === roomId) {
                setCurrentRoom(null);
                setMessages([]);
                setParticipants([]);
            }
        });

        return () => {
            socket.off('rooms');
            socket.off('messages');
            socket.off('roomDeleted');
        };
    }, [currentRoom]);

    const handleSelectRoom = (roomId) => {
        if (roomId) {
            socket.emit('joinRoom', { roomId });
            setCurrentRoom(roomId);
            const selectedRoom = rooms.find(room => room._id === roomId);
            if (selectedRoom) {
                setParticipants(selectedRoom.participants);
            }

            // Fetch messages for the selected room
            socket.emit('getMessages', { roomId });
        } else {
            console.error('Invalid roomId:', roomId);
        }
    };

    const handleSendMessage = (messageText) => {
        if (currentRoom) {
            const message = { user: user.username, text: messageText, roomId: currentRoom };
            socket.emit('sendMessage', message);
            setMessages((prevMessages) => [...prevMessages, message]);
        } else {
            console.error('No room selected');
        }
    };

    const handleCreateRoom = () => {
        if (newRoomName.trim()) {
            console.log('Creating room:', newRoomName);
            socket.emit('createRoom', newRoomName);
            setNewRoomName('');
        } else {
            console.error('Room name is empty');
        }
    };

    const handleDeleteRoom = () => {
        if (currentRoom) {
            console.log('Attempting to delete room:', currentRoom); // Debugging log
            socket.emit('deleteRoom', { roomId: currentRoom });
        }
    };

    const handleDelete = (messageId) => {
        setMessages(messages.filter(message => message.id !== messageId));
        socket.emit('deleteMessage', { messageId });
    };

    return (
        <div className="chat-page">
            <h1>Welcome to Chat, {user?.username}</h1>
            <button 
                className="logout-button"
                onClick={() => {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    navigate('/login');
                }}
            >
                Logout
            </button>
            <div className="chat-controls">
                <input
                    type="text"
                    value={newRoomName}
                    onChange={(e) => setNewRoomName(e.target.value)}
                    placeholder="New room name"
                    className="new-room-input"
                />
                <button onClick={handleCreateRoom} className="create-room-button">
                    Create Room
                </button>
            </div>
            <ChatRoomList rooms={rooms} onSelectRoom={handleSelectRoom} />
            {currentRoom && (
                <div className="chat-window">
                    <h2>Room: {rooms.find(room => room._id === currentRoom)?.name}</h2>
                    <div className="participants">
                        <h3>Participants:</h3>
                        <ul>
                            {participants.map(participant => (
                                <li key={participant._id}>{participant.username}</li>
                            ))}
                        </ul>
                    </div>
                    <MessageContainer 
                        messages={messages} 
                        currentUser={currentUser} 
                        onDelete={handleDelete} 
                    />
                    <MessageInput onSendMessage={handleSendMessage} />
                    {console.log('Current Room Creator:', rooms.find(room => room._id === currentRoom)?.createdBy?._id)}
                    {rooms.find(room => room._id === currentRoom)?.createdBy?._id === user?._id && (
                        <button onClick={handleDeleteRoom} className="delete-room-button">
                            Delete Room
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default Chat; 
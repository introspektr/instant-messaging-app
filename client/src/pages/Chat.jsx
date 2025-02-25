import { useEffect, useState } from 'react';
import io from 'socket.io-client';
import ChatRoomList from '../components/ChatRoomList';
import MessageContainer from '../components/MessageContainer';
import MessageInput from '../components/MessageInput';
import { useNavigate } from 'react-router-dom';
import '../styles/Chat.css';
import AddUserForm from '../components/AddUserForm';

const Chat = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [rooms, setRooms] = useState([]);
    const [messages, setMessages] = useState([]);
    const [newRoomName, setNewRoomName] = useState('');
    const [currentRoom, setCurrentRoom] = useState(null);
    const [participants, setParticipants] = useState([]);
    const [showSidebar, setShowSidebar] = useState(false);
    const [showParticipants, setShowParticipants] = useState(false);
    const [socket, setSocket] = useState(null);

    // Initialize socket connection
    useEffect(() => {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');

        if (!token || !userData) {
            navigate('/login');
            return;
        }

        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);

        // Create socket connection with the token
        const newSocket = io(import.meta.env.VITE_SERVER_URL, {
            auth: { token },
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5
        });

        setSocket(newSocket);

        // Clean up on unmount
        return () => {
            if (newSocket) {
                newSocket.disconnect();
            }
        };
    }, [navigate]);

    // Set up socket event listeners after socket is created
    useEffect(() => {
        if (!socket) return;

        // Set up socket connection events
        socket.on('connect', () => {
            console.log('Connected to server');
            // Explicitly request rooms when connected
            socket.emit('getRooms');
        });

        socket.on('disconnect', () => {
            console.log('Disconnected from server');
        });

        socket.on('connect_error', (error) => {
            console.error('Connection error:', error);
        });

        socket.on('rooms', (availableRooms) => {
            console.log('Available rooms:', availableRooms);
            setRooms(availableRooms);
        });

        socket.on('message', (messageData) => {
            console.log('Received message:', messageData);
            const messageToAdd = messageData.message || messageData;
            setMessages((prevMessages) => [...prevMessages, messageToAdd]);
        });

        socket.on('error', (errorMessage) => {
            console.error('Socket error:', errorMessage);
            alert(`Error: ${errorMessage}`);
        });

        socket.on('userJoined', ({ userId, message }) => {
            console.log(`User ${userId} joined: ${message}`);
            // Refresh participants list
            if (currentRoom) {
                socket.emit('getRoomParticipants', { roomId: currentRoom });
            }
        });

        socket.on('roomParticipants', (roomParticipants) => {
            setParticipants(roomParticipants);
        });

        socket.on('messageDeleted', ({ messageId }) => {
            setMessages(prevMessages => 
                prevMessages.filter(msg => 
                    (msg._id !== messageId && msg.id !== messageId)
                )
            );
        });

        socket.on('roomUpdated', (updatedRoom) => {
            setRooms(prevRooms => 
                prevRooms.map(room => 
                    room._id === updatedRoom._id ? updatedRoom : room
                )
            );
            
            if (currentRoom === updatedRoom._id) {
                setParticipants(updatedRoom.participants);
            }
        });

        socket.on('success', (message) => {
            alert(message); // You could replace this with a nicer notification
        });

        // Clean up event listeners
        return () => {
            socket.off('connect');
            socket.off('disconnect');
            socket.off('connect_error');
            socket.off('rooms');
            socket.off('message');
            socket.off('error');
            socket.off('userJoined');
            socket.off('roomParticipants');
            socket.off('messageDeleted');
            socket.off('roomUpdated');
            socket.off('success');
        };
    }, [socket, currentRoom]);

    // Room-specific event listeners
    useEffect(() => {
        if (!socket || !currentRoom) return;

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
            socket.off('messages');
            socket.off('roomDeleted');
        };
    }, [socket, currentRoom]);

    const handleSelectRoom = (roomId) => {
        if (!socket) return;
        
        if (roomId) {
            socket.emit('joinRoom', { roomId });
            setCurrentRoom(roomId);
            const selectedRoom = rooms.find(room => room._id === roomId);
            if (selectedRoom) {
                setParticipants(selectedRoom.participants);
            }

            // Fetch messages for the selected room
            socket.emit('getMessages', { roomId });
            // Also get the latest participants
            socket.emit('getRoomParticipants', { roomId });
        } else {
            console.error('Invalid roomId:', roomId);
        }
    };

    const handleSendMessage = (messageText) => {
        if (!socket) return;
        
        if (currentRoom && messageText.trim()) {
            const messageData = { 
                text: messageText, 
                roomId: currentRoom 
            };
            
            socket.emit('sendMessage', messageData);
        } else {
            console.error('No room selected or empty message');
        }
    };

    const handleCreateRoom = () => {
        if (!socket) return;
        
        if (newRoomName.trim()) {
            console.log('Creating room:', newRoomName);
            socket.emit('createRoom', { name: newRoomName });
            setNewRoomName('');
        } else {
            console.error('Room name is empty');
        }
    };

    const handleDeleteRoom = () => {
        if (!socket) return;
        
        if (currentRoom) {
            console.log('Attempting to delete room:', currentRoom);
            
            const room = rooms.find(room => room._id === currentRoom);
            console.log('Room found:', room);
            console.log('Current user ID:', user.id);
            console.log('Room creator ID:', room?.createdBy?._id);
            
            if (room && room.createdBy && String(room.createdBy._id) === String(user.id)) {
                console.log('User is creator, emitting deleteRoom event');
                socket.emit('deleteRoom', { roomId: currentRoom });
            } else {
                alert('Only the room creator can delete this room');
                console.log('Not the creator - Room creator:', String(room?.createdBy?._id), 'User:', String(user.id));
            }
        }
    };

    const handleDelete = (messageId) => {
        if (!socket) return;
        
        console.log('Attempting to delete message:', messageId);
        
        const messageToDelete = messages.find(msg => 
            (msg._id === messageId || msg.id === messageId)
        );
        
        if (!messageToDelete) {
            console.error('Message not found:', messageId);
            return;
        }
        
        socket.emit('deleteMessage', { messageId, roomId: currentRoom });
        
        // Let the server handle the UI update via the messageDeleted event
    };

    // Add this function to handle form submission
    const handleCreateRoomSubmit = (e) => {
        e.preventDefault();
        handleCreateRoom();
    };

    // Add this function to handle overlay clicks
    const handleOverlayClick = () => {
        setShowSidebar(false);
        setShowParticipants(false);
    };

    const handleAddUser = (username) => {
        if (!socket || !currentRoom) return;
        
        console.log(`Attempting to add user ${username} to room ${currentRoom}`);
        socket.emit('addUserToRoom', { roomId: currentRoom, username });
    };

    return (
        <div className="chat-app">
            {/* Mobile overlay */}
            <div 
                className={`mobile-overlay ${showSidebar || showParticipants ? 'show' : ''}`} 
                onClick={handleOverlayClick}
            ></div>
            
            <div className={`sidebar ${showSidebar ? 'show' : ''}`}>
                <div className="user-info">
                    <h3>{user?.username}</h3>
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
                </div>
                
                <div className="room-creation">
                    <form onSubmit={handleCreateRoomSubmit}>
                        <input
                            type="text"
                            value={newRoomName}
                            onChange={(e) => setNewRoomName(e.target.value)}
                            placeholder="New room name"
                            className="new-room-input"
                        />
                        <button type="submit" className="create-room-button">
                            Create Room
                        </button>
                    </form>
                </div>
                
                <ChatRoomList rooms={rooms} onSelectRoom={handleSelectRoom} currentRoom={currentRoom} />
            </div>
            
            {currentRoom ? (
                <div className="chat-area">
                    <div className="chat-header">
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <button 
                                className="show-sidebar" 
                                onClick={() => setShowSidebar(!showSidebar)}
                                title="Show channels"
                            >
                                ☰
                            </button>
                            <h2># {rooms.find(room => room._id === currentRoom)?.name}</h2>
                        </div>
                        <div>
                            <button 
                                className="show-participants" 
                                onClick={() => setShowParticipants(!showParticipants)}
                                title="Show participants"
                            >
                                👥
                            </button>
                            <button onClick={handleDeleteRoom} className="delete-room-button" title="Delete Room">
                                🗑️
                            </button>
                        </div>
                    </div>
                    
                    <MessageContainer 
                        messages={messages} 
                        onDelete={handleDelete} 
                    />
                    
                    <MessageInput onSendMessage={handleSendMessage} />
                </div>
            ) : (
                <div className="no-room-selected">
                    <div className="welcome-message">
                        <h2>Welcome to Chat!</h2>
                        <p>Select a room to start chatting or create a new one.</p>
                    </div>
                </div>
            )}
            
            {currentRoom && (
                <div className={`participants-sidebar ${showParticipants ? 'show' : ''}`}>
                    <h3>Participants</h3>
                    
                    <AddUserForm 
                        onAddUser={handleAddUser} 
                        isCreator={
                            rooms.find(room => room._id === currentRoom)?.createdBy?._id === user?.id
                        } 
                    />
                    
                    <ul className="participants-list">
                        {participants.map(participant => (
                            <li key={participant._id} className="participant">
                                <div className="participant-avatar">
                                    {participant.username.charAt(0).toUpperCase()}
                                </div>
                                <span>{participant.username}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default Chat; 
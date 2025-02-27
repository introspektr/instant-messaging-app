import { useEffect, useState, useCallback, useMemo, useRef, lazy, Suspense } from 'react';
import io from 'socket.io-client';
import ChatRoomList from '../components/ChatRoomList';
import MessageContainer from '../components/MessageContainer';
import MessageInput from '../components/MessageInput';
import { useNavigate } from 'react-router-dom';
import '../styles/Chat.css';
import ToastContainer from '../components/ToastContainer';

// Add this utility function at the top of your file
const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

// Lazy load the AddUserForm component
const AddUserForm = lazy(() => import('../components/AddUserForm'));

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
    const [connected, setConnected] = useState(false);

    // Create a ref to hold the toast functions
    const toastRef = useRef(null);
    
    // Get toast elements and functions
    const { toastElements, addToast } = ToastContainer();
    
    // Store toast functions in ref for access in event handlers
    useEffect(() => {
        toastRef.current = { addToast };
    }, [addToast]);

    // Add this near your other useMemo hooks
    const currentRoomData = useMemo(() => {
        return rooms.find(room => room._id === currentRoom) || null;
    }, [rooms, currentRoom]);

    // Then update your isCreator calculation
    const isCreator = useMemo(() => {
        if (!user || !currentRoomData) return false;
        return currentRoomData.createdBy?._id === user.id;
    }, [currentRoomData, user]);

    // Add this near your other useMemo hooks
    const filteredMessages = useMemo(() => {
        // If we have a lot of messages, this will prevent unnecessary re-filtering
        return messages;
    }, [messages]);

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

        const newSocket = io(import.meta.env.VITE_SERVER_URL, {
            auth: { token },
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5
        });

        newSocket.on('connect', () => {
            console.log('Socket connected successfully!');
            setConnected(true);
            newSocket.emit('getRooms');
        });

        newSocket.on('connect_error', (err) => {
            console.error('Connection error:', err);
            toastRef.current.addToast('Failed to connect to server', 'error');
        });

        setSocket(newSocket);

        return () => {
            if (newSocket) {
                newSocket.disconnect();
            }
        };
    }, [navigate]);

    // Set up global socket event listeners
    useEffect(() => {
        if (!socket) return;

        const handleConnect = () => {
            console.log('Connected to server');
            setConnected(true);
        };

        const handleDisconnect = () => {
            console.log('Disconnected from server');
            setConnected(false);
        };

        const handleRooms = (availableRooms) => {
            console.log('Received rooms:', availableRooms);
            setRooms(availableRooms);
        };

        // Add other event handlers...

        // Register event listeners
        socket.on('connect', handleConnect);
        socket.on('disconnect', handleDisconnect);
        socket.on('rooms', handleRooms);
        socket.on('error', (errorMessage) => {
            console.error('Socket error:', errorMessage);
            toastRef.current.addToast(errorMessage, 'error');
        });
        // Add other listeners...

        // Clean up event listeners
        return () => {
            socket.off('connect', handleConnect);
            socket.off('disconnect', handleDisconnect);
            socket.off('rooms', handleRooms);
            // Remove other listeners...
        };
    }, [socket]); // Only depends on socket

    // Room-specific event listeners
    useEffect(() => {
        if (!socket || !currentRoom) return;

        const handleMessages = (roomMessages) => {
            console.log('Received message:', roomMessages);
            setMessages(roomMessages);
        };

        const handleMessage = (messageData) => {
            console.log('Received message:', messageData);
            setMessages(prevMessages => [...prevMessages, {
                _id: messageData._id,
                content: messageData.content,
                sender: messageData.sender,
                timestamp: messageData.timestamp
            }]);
        };

        const handleMessageDeleted = ({ messageId }) => {
            setMessages(prevMessages => 
                prevMessages.filter(msg => msg._id !== messageId)
            );
        };

        const handleUserJoined = ({ userId, message }) => {
            console.log(`User ${userId} joined: ${message}`);
            socket.emit('getRoomParticipants', { roomId: currentRoom });
        };

        const handleRoomParticipants = (roomParticipants) => {
            setParticipants(roomParticipants);
        };

        // Register room-specific event listeners
        socket.on('messages', handleMessages);
        socket.on('message', handleMessage);
        socket.on('messageDeleted', handleMessageDeleted);
        socket.on('userJoined', handleUserJoined);
        socket.on('roomParticipants', handleRoomParticipants);

        // Fetch initial data for the room
        console.log('Joining room:', currentRoom);
        socket.emit('joinRoom', { roomId: currentRoom });
        socket.emit('getMessages', { roomId: currentRoom });
        socket.emit('getRoomParticipants', { roomId: currentRoom });

        // Clean up room-specific event listeners
        return () => {
            socket.off('messages', handleMessages);
            socket.off('message', handleMessage);
            socket.off('messageDeleted', handleMessageDeleted);
            socket.off('userJoined', handleUserJoined);
            socket.off('roomParticipants', handleRoomParticipants);
            socket.emit('leaveRoom', { roomId: currentRoom });
        };
    }, [socket, currentRoom]); // Only depends on socket and currentRoom

    // Handler functions using useCallback to prevent unnecessary re-renders
    const handleSelectRoom = useCallback((roomId) => {
        if (!socket) return;
        
        if (roomId) {
            setCurrentRoom(roomId);
        } else {
            console.error('Invalid roomId:', roomId);
        }
    }, [socket]);

    // Replace the current handleSendMessage implementation with this:
    const handleSendMessage = useCallback((messageText) => {
        if (!socket || !currentRoom || !messageText.trim()) return;
        
        const messageData = { 
            text: messageText, 
            roomId: currentRoom,
            sender: user.id // Include sender ID
        };
        
        console.log('Sending message:', messageData);
        socket.emit('sendMessage', messageData);
    }, [socket, currentRoom, user]);

    // Create a debounced version outside of useCallback
    const debouncedSendMessage = useMemo(() => {
        return debounce(handleSendMessage, 300);
    }, [handleSendMessage]);

    const handleCreateRoom = useCallback(() => {
        if (!socket || !newRoomName.trim()) return;
        
        console.log('Creating room:', newRoomName);
        socket.emit('createRoom', { name: newRoomName });
        setNewRoomName('');
    }, [socket, newRoomName]);

    const handleDeleteRoom = useCallback(() => {
        if (!socket || !currentRoom || !isCreator) return;
        
        console.log('Attempting to delete room:', currentRoom);
        socket.emit('deleteRoom', { roomId: currentRoom });
    }, [socket, currentRoom, isCreator]);

    const handleDeleteMessage = useCallback((messageId) => {
        if (!socket || !currentRoom) return;
        
        console.log('Attempting to delete message:', messageId);
        socket.emit('deleteMessage', { messageId, roomId: currentRoom });
    }, [socket, currentRoom]);

    const handleAddUser = useCallback((username) => {
        if (!socket || !currentRoom) return;
        
        console.log(`Attempting to add user ${username} to room ${currentRoom}`);
        socket.emit('addUserToRoom', { roomId: currentRoom, username });
    }, [socket, currentRoom]);

    const handleCreateRoomSubmit = (e) => {
        e.preventDefault();
        handleCreateRoom();
    };

    const handleOverlayClick = () => {
        setShowSidebar(false);
        setShowParticipants(false);
    };

    useEffect(() => {
        if (!socket) return;

        const handleRoomDeleted = ({ roomId }) => {
            console.log('Room deleted:', roomId);
            setRooms(prevRooms => prevRooms.filter(room => room._id !== roomId));
            if (currentRoom === roomId) {
                setCurrentRoom(null);
                setMessages([]);
                setParticipants([]);
            }
        };

        socket.on('roomDeleted', handleRoomDeleted);

        return () => {
            socket.off('roomDeleted', handleRoomDeleted);
        };
    }, [socket, currentRoom]);

    useEffect(() => {
        if (!socket) return;

        const handleMessageDeleted = ({ messageId }) => {
            setMessages(prevMessages => 
                prevMessages.filter(msg => msg._id !== messageId)
            );
        };

        socket.on('messageDeleted', handleMessageDeleted);

        return () => {
            socket.off('messageDeleted', handleMessageDeleted);
        };
    }, [socket]);

    // Rest of your component remains the same, but update the props to use the memoized values
    return (
        <>
            {toastElements}
            <div className="chat-app">
                {/* Mobile overlay */}
                <div 
                    className={`mobile-overlay ${showSidebar || showParticipants ? 'show' : ''}`} 
                    onClick={handleOverlayClick}
                ></div>
                
                <div className={`sidebar ${showSidebar ? 'show' : ''}`}>
                    <div className="user-info">
                        <h3>{user?.username}</h3>
                        <div className="connection-status">
                            <span className={`status-indicator ${connected ? 'online' : 'offline'}`}></span>
                            {connected ? 'Connected' : 'Disconnected'}
                        </div>
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
                    
                    <ChatRoomList 
                        rooms={rooms} 
                        onSelectRoom={handleSelectRoom} 
                        currentRoom={currentRoom} 
                    />
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
                                <h2># {currentRoomData?.name}</h2>
                            </div>
                            <div>
                                <button 
                                    className="show-participants" 
                                    onClick={() => setShowParticipants(!showParticipants)}
                                    title="Show participants"
                                >
                                    👥
                                </button>
                                {isCreator && (
                                    <button 
                                        onClick={handleDeleteRoom} 
                                        className="delete-room-button" 
                                        title="Delete Room"
                                    >
                                        🗑️
                                    </button>
                                )}
                            </div>
                        </div>
                        
                        <MessageContainer 
                            messages={filteredMessages} 
                            onDelete={handleDeleteMessage} 
                        />
                        
                        <MessageInput onSendMessage={debouncedSendMessage} />
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
                        
                        <Suspense fallback={<div>Loading...</div>}>
                            <AddUserForm 
                                onAddUser={handleAddUser} 
                                isCreator={isCreator} 
                            />
                        </Suspense>
                        
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
        </>
    );
};

export default Chat; 
/**
 * Chat Page Component
 * 
 * This is the main application interface where users:
 * - View and send messages in different chat rooms
 * - Create new chat rooms
 * - See other participants in a room
 * - Add users to rooms (if they're the creator)
 * 
 * The component uses Socket.IO for real-time communication with the server.
 */
import { useEffect, useState, useCallback, useMemo, useRef, lazy, Suspense } from 'react';
import io from 'socket.io-client';  // Socket.IO client for real-time communication
import ChatRoomList from '../components/ChatRoomList';  // Component to display available rooms
import MessageContainer from '../components/MessageContainer';  // Component to display messages
import MessageInput from '../components/MessageInput';  // Component for typing and sending messages
import { useNavigate } from 'react-router-dom';  // Hook for navigation between pages
import '../styles/Chat.css';  // Chat-specific styles
import ToastContainer from '../components/ToastContainer';  // Notification component
import blabLogo from '../assets/blab-logo.svg';  // App logo

/**
 * Debounce Utility Function
 * 
 * This prevents a function from being called too frequently.
 * Example: If a user clicks a button many times quickly, we only respond to the last click.
 * 
 * @param {Function} func - The function to debounce
 * @param {number} wait - Time to wait in milliseconds before executing the function
 * @returns {Function} - A debounced version of the original function
 */
const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        // Function to run after the delay
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        // Reset the timer each time the function is called
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

// Using lazy loading for the AddUserForm component
// This means it won't be loaded until it's actually needed, improving initial load time
const AddUserForm = lazy(() => import('../components/AddUserForm'));

const Chat = () => {
    // --- Navigation and User State ---
    const navigate = useNavigate();  // Hook for navigating between pages
    const [user, setUser] = useState(null);  // Logged-in user information
    
    // --- Room and Message State ---
    const [rooms, setRooms] = useState([]);  // List of available chat rooms
    const [messages, setMessages] = useState([]);  // Messages in the current room
    const [newRoomName, setNewRoomName] = useState('');  // Name for creating a new room
    const [currentRoom, setCurrentRoom] = useState(null);  // Currently selected room ID
    const [participants, setParticipants] = useState([]);  // Users in the current room
    
    // --- UI State ---
    const [showSidebar, setShowSidebar] = useState(false);  // Mobile sidebar visibility
    const [showParticipants, setShowParticipants] = useState(false);  // Participants sidebar visibility
    
    // --- Socket State ---
    const [socket, setSocket] = useState(null);  // Socket.IO connection
    const [connected, setConnected] = useState(false);  // Connection status

    // --- Toast Notifications ---
    // Create a ref to hold toast functions so they can be accessed in event handlers
    // This is necessary because event handlers created in useEffect would otherwise
    // have access to "stale" values from when they were created
    const toastRef = useRef(null);
    
    // Get toast elements and functions from the ToastContainer component
    const { toastElements, addToast } = ToastContainer();
    
    // Store toast functions in the ref so they can be used from any event handler
    useEffect(() => {
        toastRef.current = { addToast };
    }, [addToast]);

    /**
     * Memoized Room Data
     * 
     * Find the complete room object for the currently selected room.
     * Using useMemo prevents recalculating this value unless rooms or currentRoom changes.
     */
    const currentRoomData = useMemo(() => {
        return rooms.find(room => room._id === currentRoom) || null;
    }, [rooms, currentRoom]);

    /**
     * Check if Current User is Room Creator
     * 
     * Determines if the logged-in user created the current room.
     * This controls whether they can see admin functions like deleting the room.
     */
    const isCreator = useMemo(() => {
        if (!user || !currentRoomData) return false;
        return currentRoomData.createdBy?._id === user.id;
    }, [currentRoomData, user]);

    /**
     * Filtered Messages
     * 
     * This would be the place to add message filtering if needed.
     * Currently returns all messages, but is designed to be extended
     * if filtering features are added later.
     */
    const filteredMessages = useMemo(() => {
        // If we have a lot of messages, this will prevent unnecessary re-filtering
        return messages;
    }, [messages]);

    /**
     * Socket Connection Setup
     * 
     * This effect runs once when the component mounts.
     * It:
     * 1. Gets the authentication token from localStorage
     * 2. Establishes the Socket.IO connection to the server
     * 3. Sets up basic connection event handlers
     */
    useEffect(() => {
        // Get authentication data from local storage
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        const username = localStorage.getItem('username');

        // If no token or user data, redirect to login page
        if (!token || !userId || !username) {
            navigate('/login');
            return;
        }

        // Create user object from localStorage data
        const user = {
            id: userId,
            username: username
        };
        
        // Store user in state
        setUser(user);

        // Create a new Socket.IO connection with authentication
        const newSocket = io(import.meta.env.VITE_SERVER_URL, {
            auth: { token },  // Send token for authentication
            reconnection: true,  // Enable automatic reconnection
            reconnectionDelay: 1000,  // Wait 1 second before trying to reconnect
            reconnectionAttempts: 5  // Try to reconnect up to 5 times
        });

        // Handle successful connection
        newSocket.on('connect', () => {
            console.log('Socket connected successfully!');
            setConnected(true);
            newSocket.emit('getRooms');  // Request the list of available rooms
        });

        // Handle connection errors
        newSocket.on('connect_error', (err) => {
            console.error('Connection error:', err);
            toastRef.current.addToast('Failed to connect to server', 'error');
        });

        // Store the socket in state
        setSocket(newSocket);

        // Cleanup function to disconnect when component unmounts
        return () => {
            if (newSocket) {
                newSocket.disconnect();
            }
        };
    }, [navigate]);  // Only runs on first render and if navigate changes

    /**
     * Global Socket Event Listeners
     * 
     * This effect sets up event listeners for socket events that aren't
     * specific to any particular room, like connection status and room list updates.
     */
    useEffect(() => {
        if (!socket) return;  // Skip if socket isn't initialized

        // Event handler functions
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

        // Register event listeners
        socket.on('connect', handleConnect);
        socket.on('disconnect', handleDisconnect);
        socket.on('rooms', handleRooms);
        socket.on('error', (errorMessage) => {
            console.error('Socket error:', errorMessage);
            toastRef.current.addToast(errorMessage, 'error');
        });

        // Cleanup function to remove event listeners when component unmounts
        // or when the socket changes
        return () => {
            socket.off('connect', handleConnect);
            socket.off('disconnect', handleDisconnect);
            socket.off('rooms', handleRooms);
            socket.off('error');
        };
    }, [socket]);  // Re-run if socket changes

    /**
     * Room-Specific Event Listeners
     * 
     * This effect sets up event listeners for a specific chat room.
     * It runs whenever the current room changes, removing old listeners
     * and setting up new ones for the selected room.
     */
    useEffect(() => {
        if (!socket || !currentRoom) return;  // Skip if no socket or no room selected

        // Event handler for receiving all messages in a room
        const handleMessages = (roomMessages) => {
            console.log('Received message:', roomMessages);
            setMessages(roomMessages);
        };

        // Event handler for receiving a single new message
        const handleMessage = (messageData) => {
            console.log('Received message:', messageData);
            setMessages(prevMessages => [...prevMessages, {
                _id: messageData._id,
                content: messageData.content,
                sender: messageData.sender,
                timestamp: messageData.timestamp
            }]);
        };

        // Event handler for when a message is deleted
        const handleMessageDeleted = ({ messageId }) => {
            setMessages(prevMessages => 
                prevMessages.filter(msg => msg._id !== messageId)
            );
        };

        // Event handler for when a new user joins the room
        const handleUserJoined = ({ userId, message }) => {
            console.log(`User ${userId} joined: ${message}`);
            socket.emit('getRoomParticipants', { roomId: currentRoom });
        };

        // Event handler for receiving the list of participants
        const handleRoomParticipants = (roomParticipants) => {
            setParticipants(roomParticipants);
        };

        // Register room-specific event listeners
        socket.on('messages', handleMessages);
        socket.on('message', handleMessage);
        socket.on('messageDeleted', handleMessageDeleted);
        socket.on('userJoined', handleUserJoined);
        socket.on('roomParticipants', handleRoomParticipants);

        // Tell the server we're joining this room and request initial data
        console.log('Joining room:', currentRoom);
        socket.emit('joinRoom', { roomId: currentRoom });
        socket.emit('getMessages', { roomId: currentRoom });
        socket.emit('getRoomParticipants', { roomId: currentRoom });

        // Cleanup function to remove event listeners and leave the room
        // when changing to a different room or unmounting
        return () => {
            socket.off('messages', handleMessages);
            socket.off('message', handleMessage);
            socket.off('messageDeleted', handleMessageDeleted);
            socket.off('userJoined', handleUserJoined);
            socket.off('roomParticipants', handleRoomParticipants);
            socket.emit('leaveRoom', { roomId: currentRoom });
        };
    }, [socket, currentRoom]);  // Re-run when socket or currentRoom changes

    /**
     * Handle Room Selection
     * 
     * This function is called when a user clicks on a room in the room list.
     * It updates the currentRoom state, which triggers the room-specific effect above.
     */
    const handleSelectRoom = useCallback((roomId) => {
        if (!socket) return;
        
        if (roomId) {
            setCurrentRoom(roomId);
        } else {
            console.error('Invalid roomId:', roomId);
        }
    }, [socket]);

    /**
     * Handle Sending Messages
     * 
     * This function is called when a user submits a message.
     * It emits the message to the server via the socket connection.
     */
    const handleSendMessage = useCallback((messageText) => {
        if (!socket || !currentRoom) return;
        
        if (!messageText.trim()) {
            toastRef.current.addToast('Message cannot be empty', 'error');
            return;
        }
        
        const messageData = { 
            text: messageText, 
            roomId: currentRoom,
            sender: user.id  // Include sender ID
        };
        
        console.log('Sending message:', messageData);
        socket.emit('sendMessage', messageData);
    }, [socket, currentRoom, user]);

    /**
     * Debounced Send Message Function
     * 
     * This creates a debounced version of the send message function.
     * This prevents accidental double-sends if a user clicks quickly.
     */
    const debouncedSendMessage = useMemo(() => {
        return debounce(handleSendMessage, 300);  // 300ms delay
    }, [handleSendMessage]);

    /**
     * Handle Creating a New Room
     * 
     * This function is called when a user submits the new room form.
     * It validates the input and sends a create room request to the server.
     */
    const handleCreateRoom = useCallback(() => {
        if (!socket) return;
        
        if (!newRoomName.trim()) {
            toastRef.current.addToast('Room name cannot be empty', 'error');
            return;
        }
        
        console.log('Creating room:', newRoomName);
        socket.emit('createRoom', { name: newRoomName });
        setNewRoomName('');  // Clear the input field
    }, [socket, newRoomName]);

    /**
     * Handle Deleting a Room
     * 
     * This function is called when a room creator clicks the delete button.
     * It sends a delete room request to the server.
     */
    const handleDeleteRoom = useCallback(() => {
        if (!socket || !currentRoom || !isCreator) return;
        
        console.log('Attempting to delete room:', currentRoom);
        socket.emit('deleteRoom', { roomId: currentRoom });
    }, [socket, currentRoom, isCreator]);

    /**
     * Handle Deleting a Message
     * 
     * This function is called when a user clicks the delete button on a message.
     * It sends a delete message request to the server.
     */
    const handleDeleteMessage = useCallback((messageId) => {
        if (!socket || !currentRoom) return;
        
        console.log('Attempting to delete message:', messageId);
        socket.emit('deleteMessage', { messageId, roomId: currentRoom });
    }, [socket, currentRoom]);

    /**
     * Handle Adding a User to a Room
     * 
     * This function is called when a room creator adds a user to the room.
     * It validates the input and sends an add user request to the server.
     */
    const handleAddUser = useCallback((username) => {
        if (!socket || !currentRoom) return;
        
        if (!username.trim()) {
            toastRef.current.addToast('Username cannot be empty', 'error');
            return;
        }
        
        console.log(`Attempting to add user ${username} to room ${currentRoom}`);
        socket.emit('addUserToRoom', { roomId: currentRoom, username });
    }, [socket, currentRoom]);

    /**
     * Handle Create Room Form Submission
     * 
     * This function is called when the create room form is submitted.
     * It prevents the default form behavior and calls handleCreateRoom.
     */
    const handleCreateRoomSubmit = (e) => {
        e.preventDefault();
        handleCreateRoom();
    };

    /**
     * Handle Mobile Overlay Click
     * 
     * This function is called when the mobile overlay is clicked.
     * It closes both sidebars in mobile view.
     */
    const handleOverlayClick = () => {
        setShowSidebar(false);
        setShowParticipants(false);
    };

    /**
     * Room Deletion Event Handler
     * 
     * This effect sets up an event listener for when a room is deleted.
     * It updates the local state to remove the deleted room.
     */
    useEffect(() => {
        if (!socket) return;

        const handleRoomDeleted = ({ roomId }) => {
            console.log('Room deleted:', roomId);
            // Remove the room from the rooms list
            setRooms(prevRooms => prevRooms.filter(room => room._id !== roomId));
            // If the deleted room is the current one, reset the current room
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

    /**
     * Message Deletion Event Handler
     * 
     * This effect sets up an event listener for when a message is deleted.
     * It updates the local state to remove the deleted message.
     */
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

    // Render the component
    return (
        <>
            {/* Toast notifications appear at the top of the screen */}
            {toastElements}
            
            <div className="chat-app">
                {/* Mobile overlay - shown when a sidebar is open on mobile */}
                <div 
                    className={`mobile-overlay ${showSidebar || showParticipants ? 'show' : ''}`} 
                    onClick={handleOverlayClick}
                ></div>
                
                {/* Room list sidebar */}
                <div className={`sidebar ${showSidebar ? 'show' : ''}`}>
                    {/* User info section */}
                    <div className="user-info">
                        <h3>{user?.username}</h3>
                        {(user?.firstName || user?.lastName) && (
                            <div className="user-fullname">
                                {user?.firstName} {user?.lastName}
                            </div>
                        )}
                        <div className="connection-status">
                            <span className={`status-indicator ${connected ? 'online' : 'offline'}`}></span>
                            {connected ? 'Connected' : 'Disconnected'}
                        </div>
                        <div className="user-actions">
                            <button 
                                className="profile-button"
                                onClick={() => navigate('/profile')}
                                title="Edit Profile"
                            >
                                Edit Profile
                            </button>
                            <button 
                                className="logout-button"
                                onClick={() => {
                                    localStorage.removeItem('token');
                                    localStorage.removeItem('user');
                                    navigate('/login');
                                }}
                                title="Logout"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                    
                    {/* Room creation form */}
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
                    
                    {/* List of available rooms */}
                    <ChatRoomList 
                        rooms={rooms} 
                        onSelectRoom={handleSelectRoom} 
                        currentRoom={currentRoom} 
                    />
                </div>
                
                {/* Main chat area - shown when a room is selected */}
                {currentRoom ? (
                    <div className="chat-area">
                        {/* Chat header with room name and controls */}
                        <div className="chat-header">
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <button 
                                    className="show-sidebar" 
                                    onClick={() => setShowSidebar(!showSidebar)}
                                    title="Show channels"
                                >
                                    ☰
                                </button>
                                <img src={blabLogo} alt="Blab" className="header-logo" />
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
                        
                        {/* Message display area */}
                        <MessageContainer 
                            messages={filteredMessages} 
                            onDelete={handleDeleteMessage} 
                        />
                        
                        {/* Message input form */}
                        <MessageInput onSendMessage={debouncedSendMessage} />
                    </div>
                ) : (
                    /* Welcome screen shown when no room is selected */
                    <div className="no-room-selected">
                        <div className="welcome-message">
                            <img src={blabLogo} alt="Blab Logo" className="welcome-logo" />
                            <h2>Welcome to Blab!</h2>
                            <p>Select a room to start Blabbering or create a new one.</p>
                        </div>
                    </div>
                )}
                
                {/* Participants sidebar - shown when a room is selected */}
                {currentRoom && (
                    <div className={`participants-sidebar ${showParticipants ? 'show' : ''}`}>
                        <h3>Participants</h3>
                        
                        {/* Lazily-loaded AddUserForm - only for room creators */}
                        <Suspense fallback={<div>Loading...</div>}>
                            <AddUserForm 
                                onAddUser={handleAddUser} 
                                isCreator={isCreator} 
                            />
                        </Suspense>
                        
                        {/* List of participants in the room */}
                        <ul className="participants-list">
                            {participants.map(participant => {
                                // Use username for display
                                const displayName = participant.username;
                                
                                // Get first letter for avatar from username
                                const avatarLetter = participant.username.charAt(0);
                                    
                                return (
                                    <li key={participant._id} className="participant">
                                        <div className="participant-avatar">
                                            {avatarLetter.toUpperCase()}
                                        </div>
                                        <span>{displayName}</span>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                )}
            </div>
        </>
    );
};

export default Chat; 
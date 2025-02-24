import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Chat.css';

const Chat = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    useEffect(() => {
        // Check if user is logged in
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');

        if (!token || !userData) {
            navigate('/login');
            return;
        }

        setUser(JSON.parse(userData));
    }, [navigate]);

    return (
        <div className="chat-container">
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
        </div>
    );
};

export default Chat; 
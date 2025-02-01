import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useParams } from 'react-router-dom';
import Register from './components/Register';
import Login from './components/Login';
import Home from './components/Home';
import ChatRoom from './components/ChatRoom';

const App = () => {
  return (
    <Router>
      <nav>
        <ul>
          <li>
            <Link to="/register">Register</Link>
          </li>
          <li>
            <Link to="/login">Login</Link>
          </li>
          <li>
            <Link to="/chat/1">Chat Room</Link> {/* Example link to a chat room */}
          </li>
        </ul>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/chat/:chatRoomId" element={<ChatRoomWrapper />} /> {/* Add this route */}
      </Routes>
    </Router>
  );
};

// Wrapper component to extract chatRoomId from the URL
const ChatRoomWrapper = () => {
  const { chatRoomId } = useParams(); // Extract chatRoomId from the URL
  const userId = localStorage.getItem('userId'); // Get userId from local storage

  return <ChatRoom chatRoomId={chatRoomId} userId={userId} />;
};

export default App;
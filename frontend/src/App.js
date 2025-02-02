import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useParams } from 'react-router-dom';
import { Navbar, Nav, Container } from 'react-bootstrap';
import Register from './components/Register';
import Login from './components/Login';
import Home from './components/Home';
import ChatRoom from './components/ChatRoom';

const App = () => {
  return (
    <Router>
      <Navbar bg="light" expand="lg">
        <Container>
          <Navbar.Brand as={Link} to="/">Instant Messaging App</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/register">Register</Nav.Link>
              <Nav.Link as={Link} to="/login">Login</Nav.Link>
              <Nav.Link as={Link} to="/chat/1">Chat Room</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container className="mt-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/chat/:chatRoomId" element={<ChatRoomWrapper />} />
        </Routes>
      </Container>
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
import React, { useEffect, useState } from 'react';
import socket from '../socket';
import axios from 'axios';

const ChatRoom = ({ chatRoomId, userId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  // Fetch existing messages when the component mounts
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/messages/${chatRoomId}`);
        setMessages(response.data);
      } catch (err) {
        console.error('Failed to fetch messages:', err);
      }
    };

    fetchMessages();
  }, [chatRoomId]);

  // Connect to the Socket.IO server and join the chat room
  useEffect(() => {
    socket.connect();
    socket.emit('joinRoom', chatRoomId);

    // Listen for new messages
    socket.on('receiveMessage', (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    // Cleanup on unmount
    return () => {
      socket.disconnect();
    };
  }, [chatRoomId]);

  // Send a new message
  const sendMessage = async () => {
    if (newMessage.trim()) {
      const message = {
        chatRoomId,
        senderId: userId,
        content: newMessage,
      };

      // Emit the message to the server
      socket.emit('sendMessage', message);

      // Clear the input field
      setNewMessage('');
    }
  };

  return (
    <div>
      <h2>Chat Room</h2>
      <div>
        {messages.map((message) => (
          <div key={message._id}>
            <strong>{message.senderId.firstName}: </strong>
            <span>{message.content}</span>
          </div>
        ))}
      </div>
      <input
        type="text"
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        placeholder="Type a message..."
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
};

export default ChatRoom;
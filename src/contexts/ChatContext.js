import axios from 'axios';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthContext } from './AuthContext';

export const ChatContext = createContext();

export const ChatProvider = ({ children, socket }) => {
  const { user } = useContext(AuthContext);
  const [contacts, setContacts] = useState([]);
  const [activeContact, setActiveContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState({});
  
  // Load contacts
  // Load contacts
  useEffect(() => {
    const getContacts = async () => {
      if (!user) return;
      
      try {
        // Get all users to populate the contacts list
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/users/contacts', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Handle the new response format
        if (res.data.userContacts && res.data.allUsers) {
          // Store both user contacts and all available users
          setContacts({
            userContacts: res.data.userContacts,
            allUsers: res.data.allUsers
          });
        } else {
          // Fallback for backward compatibility
          setContacts(res.data);
        }
        console.log('Loaded contacts:', res.data);
      } catch (error) {
        console.error('Error loading contacts:', error);
      }
    };
    
    getContacts();
  }, [user]);
  
  // Socket event listeners
  useEffect(() => {
    if (!socket || !user) return;
    
    // Login user to socket
    socket.emit('user_login', user.id);
    
    // Listen for online users
    socket.on('user_status', (users) => {
      setOnlineUsers(users);
    });
    
    // Listen for new messages
    socket.on('receive_message', (messageData) => {
      if (activeContact === messageData.sender) {
        // Mark as read if from active contact
        markMessagesAsRead(messageData.sender);
      }
      
      setMessages((prevMessages) => [...prevMessages, messageData]);
    });
    
    // Listen for typing indicators
    socket.on('typing_indicator', ({ senderId, isTyping }) => {
      setTypingUsers((prev) => ({
        ...prev,
        [senderId]: isTyping,
      }));
    });
    
    return () => {
      socket.off('user_status');
      socket.off('receive_message');
      socket.off('typing_indicator');
    };
  }, [socket, user, activeContact]);
  
  // Load messages when active contact changes
  useEffect(() => {
    const getMessages = async () => {
      if (!user || !activeContact) return;
      
      try {
        // For self-chat, we need to get messages where sender and recipient are the same
        const res = await axios.get(`http://localhost:5000/api/messages/${activeContact}`);
        setMessages(res.data);
        
        // Mark messages as read
        if (activeContact !== user._id) { // Don't mark as read for self-chat
          markMessagesAsRead(activeContact);
        }
      } catch (error) {
        console.error('Error loading messages:', error);
      }
    };
    
    getMessages();
  }, [user, activeContact]);
  
  // Send a message
  const sendMessage = async (text, media = '') => {
    if (!user || !activeContact || !text.trim()) return;
    
    try {
      const messageData = {
        recipient: activeContact,
        text,
        media,
      };
      
      // Save to database
      const res = await axios.post('http://localhost:5000/api/messages', messageData);
      
      // Send via socket
      socket.emit('send_message', {
        ...messageData,
        sender: user.id,
        _id: res.data._id,
        createdAt: res.data.createdAt,
      });
      
      // Update local messages
      setMessages((prevMessages) => [...prevMessages, res.data]);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };
  
  // Mark messages as read
  const markMessagesAsRead = async (senderId) => {
    if (!user || !senderId) return;
    
    try {
      await axios.put(`http://localhost:5000/api/messages/read/${senderId}`);
      
      // Update local messages
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.sender === senderId ? { ...msg, read: true } : msg
        )
      );
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };
  
  // Send typing status
  const sendTypingStatus = (recipientId, isTyping) => {
    if (!socket || !user || !recipientId) return;
    
    socket.emit('typing', {
      senderId: user.id,
      recipientId,
      isTyping
    });
  };
  
  // Add this function to the ChatContext
  const refreshContacts = async () => {
    if (!user) return;
    
    try {
      const res = await axios.get('http://localhost:5000/api/users/contacts');
      setContacts(res.data);
    } catch (error) {
      console.error('Error refreshing contacts:', error);
    }
  };
  
  // Add a socket listener for connection responses
  useEffect(() => {
    if (!socket || !user) return;
    
    socket.on('connection_response', (data) => {
      if (data.accepted) {
        refreshContacts(); // Refresh contacts when a connection is accepted
      }
    });
    
    return () => {
      socket.off('connection_response');
    };
  }, [socket, user]);
  
  return (
    <ChatContext.Provider
      value={{
        contacts,
        activeContact,
        setActiveContact,
        messages,
        sendMessage,
        onlineUsers,
        typingUsers,
        sendTypingStatus,
        markMessagesAsRead,
        refreshContacts // Add this to the context value
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

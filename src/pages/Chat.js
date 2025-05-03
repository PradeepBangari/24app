import React, { useContext, useEffect, useRef, useState } from 'react';
import { FaCog, FaPlus, FaSignOutAlt, FaUserFriends, FaPaperPlane, FaSync } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import ConnectionNotification from '../components/ConnectionNotification';
import ConnectionRequest from '../components/ConnectionRequest';
import { AuthContext } from '../contexts/AuthContext';
import { ChatContext } from '../contexts/ChatContext';
import { getProfilePicture } from '../utils/profileUtils';
import './Chat.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, Container, Card, Row, Col } from 'react-bootstrap';

const Chat = () => {
  const { user, logout, refreshUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const { 
    contacts, 
    activeContact, 
    setActiveContact, 
    messages, 
    sendMessage, 
    onlineUsers, 
    typingUsers,
    sendTypingStatus,
    refreshContacts 
  } = useContext(ChatContext);
  
  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef(null);
  const [showConnectionForm, setShowConnectionForm] = useState(false);
  const [showConnectionRequests, setShowConnectionRequests] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showLogoutProfile, setShowLogoutProfile] = useState(false);
  
  // Create a self-chat option
  const selfChat = user ? {
    _id: user._id,
    username: `${user.username} (You)`,
    enleId: user.enleId,
    status: "Your personal notes",
    profilePic: user?.profilePic || '/default-avatar.png',
    isSelf: true
  } : null;
  
  // If no active contact is selected and user exists, default to self-chat
  useEffect(() => {
    if (user && !activeContact) {
      setActiveContact(user._id);
    }
  }, [user, activeContact, setActiveContact]);
  
  // Filter contacts to only show the current user's contacts
  const filteredContacts = React.useMemo(() => {
    if (!user || !user.contacts || user.contacts.length === 0) {
      return [];
    }
    
    // Map user's contacts to the full contact objects
    return user.contacts.map(userContact => {
      // Try to find the full contact info from contacts array
      const contactId = userContact.userId && typeof userContact.userId === 'object' 
        ? userContact.userId._id 
        : userContact.userId;
        
      let fullContact = null;
      
      // Check if contacts has the new structure
      if (contacts.allUsers) {
        fullContact = contacts.allUsers.find(c => c._id === contactId);
      } else if (Array.isArray(contacts)) {
        // Old structure
        fullContact = contacts.find(c => c._id === contactId);
      }
      
      // If found in contacts array, use that data, otherwise use the data from user.contacts
      return fullContact || {
        _id: contactId,
        username: userContact.username,
        enleId: userContact.enleId,
        profilePic: userContact.profilePic,
        status: userContact.status || 'Online'
      };
    });
  }, [user, contacts]);
  
  // Auto-scroll to bottom of messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    
    sendMessage(messageText);
    setMessageText('');
  };

  const handleRefresh = async () => {
    await refreshUser();
    await refreshContacts();
  };
  
  const handleTyping = (e) => {
    setMessageText(e.target.value);
    sendTypingStatus(activeContact, e.target.value.length > 0);
  };
  
  // Find contact by ID - Improved version
  const getContactName = (contactId) => {
  // For self-chat
  if (user && contactId === user._id) return selfChat.username;
  
  // Check in user's contacts array first (most reliable source)
  if (user && user.contacts && user.contacts.length > 0) {
    const userContact = user.contacts.find(c => {
      const contactUserId = c.userId && typeof c.userId === 'object' ? c.userId._id : c.userId;
      return contactUserId === contactId;
    });
    
    if (userContact && userContact.username) {
      return userContact.username;
    }
  }
  
  // Then check in contacts from ChatContext
  if (contacts.userContacts) {
    // New structure
    const userContact = contacts.userContacts.find(c => {
      const contactUserId = c.userId && typeof c.userId === 'object' ? c.userId._id : c.userId;
      return contactUserId === contactId;
    });
    
    if (userContact && userContact.username) {
      return userContact.username;
    }
    
    // Check in allUsers
    const allUser = contacts.allUsers.find(c => c._id === contactId);
    if (allUser) return allUser.username;
  } else if (Array.isArray(contacts)) {
    // Old structure
    const contact = contacts.find(c => c._id === contactId);
    if (contact && contact.username) return contact.username;
  }
  
  return 'Unknown';
};

// Get contact Enle ID - New function
const getContactEnleId = (contactId) => {
  // For self-chat
  if (user && contactId === user._id) return user.enleId;
  
  // Check in user's contacts array first
  if (user && user.contacts && user.contacts.length > 0) {
    const userContact = user.contacts.find(c => {
      const contactUserId = c.userId && typeof c.userId === 'object' ? c.userId._id : c.userId;
      return contactUserId === contactId;
    });
    
    if (userContact && userContact.enleId) {
      return userContact.enleId;
    }
  }
  
  // Then check in contacts from ChatContext
  if (contacts.userContacts) {
    // New structure
    const userContact = contacts.userContacts.find(c => {
      const contactUserId = c.userId && typeof c.userId === 'object' ? c.userId._id : c.userId;
      return contactUserId === contactId;
    });
    
    if (userContact && userContact.enleId) {
      return userContact.enleId;
    }
    
    // Check in allUsers
    const allUser = contacts.allUsers.find(c => c._id === contactId);
    if (allUser) return allUser.enleId;
  } else if (Array.isArray(contacts)) {
    // Old structure
    const contact = contacts.find(c => c._id === contactId);
    if (contact && contact.enleId) return contact.enleId;
  }
  
  return 'Unknown';
};

// Get contact profile picture - Improved version
const getContactProfilePic = (contactId) => {
  // For self-chat
  if (user && contactId === user._id) return selfChat.profilePic;
  
  // First check in contacts array from ChatContext
  if (contacts.allUsers) {
    // New structure
    const contact = contacts.allUsers.find(c => c._id === contactId);
    if (contact) {
      const pic = getProfilePicture(contact);
      if (pic) return pic;
    }
  } else if (Array.isArray(contacts)) {
    // Old structure (fallback)
    const contact = contacts.find(c => c._id === contactId);
    if (contact) {
      const pic = getProfilePicture(contact);
      if (pic) return pic;
    }
  }
  
  // Then check in user's contacts array
  if (user && user.contacts) {
    const userContact = user.contacts.find(c => 
      (c.userId && (c.userId === contactId || c.userId._id === contactId)) || 
      c._id === contactId
    );
    if (userContact && userContact.profilePic) return userContact.profilePic;
  }
  
  // Generate emoji-based profile picture if no picture is found
  return generateEmojiProfilePic(contactId);
};

// Generate emoji-based profile picture
const generateEmojiProfilePic = (userId) => {
  const emojis = ['😀', '😎', '🤩', '🥳', '😊', '🤓', '🤠', '👻', '🐱', '🦊', '🐶', '🐼'];
  
  // Use userId to consistently select the same emoji for a user
  let hash = 0;
  const id = userId.toString();
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  const emojiIndex = Math.abs(hash % emojis.length);
  
  // Create a data URL with the emoji
  const canvas = document.createElement('canvas');
  canvas.width = 200;
  canvas.height = 200;
  const ctx = canvas.getContext('2d');
  
  // Background color
  ctx.fillStyle = `hsl(${Math.abs(hash % 360)}, 70%, 80%)`;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Emoji
  ctx.font = '120px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(emojis[emojiIndex], canvas.width / 2, canvas.height / 2);
  
  return canvas.toDataURL();
};
  
  // Check if user is online
  const isOnline = (contactId) => {
    return onlineUsers.includes(contactId);
  };
  
  // Format timestamp
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Handle plus icon click - show connection request form
  const handleAddContactClick = () => {
    setShowConnectionForm(true);
    setShowConnectionRequests(false);
    setShowSettings(false);
  };

  // Handle user icon click - show connection requests
  const handleUserFriendsClick = () => {
    setShowConnectionRequests(true);
    setShowConnectionForm(false);
    setShowSettings(false);
  };

  // Handle settings icon click - show settings
  const handleSettingsClick = () => {
    setShowSettings(true);
    setShowConnectionForm(false);
    setShowConnectionRequests(false);
  };

  // Handle logout with profile display
  // Add this state for logout confirmation at the top with other state declarations
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  
  // Modify the handleLogout function to show confirmation first
  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };
  
  // Add a function to handle confirmed logout
  const confirmLogout = () => {
    // Clear any session data
    localStorage.removeItem('token'); // Remove auth token
    sessionStorage.clear(); // Clear any session storage data
    
    // Reset states
    setActiveContact(null);
    setMessageText('');
    setShowConnectionForm(false);
    setShowConnectionRequests(false);
    setShowSettings(false);
    
    // Call the logout function from AuthContext
    logout();
    setShowLogoutProfile(true);
    setShowLogoutConfirm(false);
  };
  
  // Add a function to cancel logout
  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  // If showing logout profile, render that instead of the chat
  if (showLogoutProfile) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <Card className="text-center shadow" style={{ maxWidth: '400px' }}>
          <Card.Body>
            <Card.Title as="h2" className="mb-4">You have been logged out</Card.Title>
            <Row>
              <Col>
                <div className="d-flex justify-content-center gap-2">
                  <Button as={Link} to="/login" size="sm" variant="primary">Login</Button>
                  <Button as={Link} to="/register" size="sm" variant="outline-primary">Register</Button>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  return (
    <div className="chat-container">
      <div className="sidebar">
        <div className="user-profile">
          <img src={user?.profilePic || '/default-avatar.png'} alt="Profile" />
          <h3>{user?.username}</h3>
          <p className="enle-id">Enle ID: {user?.enleId}</p>
          <p>{user?.status}</p>
        </div>

        {/* Button row */}
        <div className="sidebar-actions">
          <button onClick={handleAddContactClick} title="Add Contact">
            <FaPlus />
          </button>
          <button onClick={handleUserFriendsClick} title="Connection Requests">
            <FaUserFriends /> 
          </button>
          <button onClick={handleSettingsClick} title="Settings">
            <FaCog />
          </button>
          <button onClick={handleRefresh} title="Refresh Contacts">
            <FaSync />
          </button>
          <button onClick={handleLogout} title="Logout">
            <FaSignOutAlt />
          </button>
        </div>
        
        {/* Show connection form when plus icon is clicked */}
        {showConnectionForm && (
          <div className="connection-form-container">
            <h3>Add New Contact</h3>
            <ConnectionRequest onClose={() => setShowConnectionForm(false)} />
          </div>
        )}
        
        {/* Show connection requests when user icon is clicked */}
        {showConnectionRequests && (
          <div className="connection-requests-container">
            <ConnectionNotification />
            <button 
              className="close-btn" 
              onClick={() => setShowConnectionRequests(false)}
            >
              Close
            </button>
          </div>
        )}

        {/* Show settings when settings icon is clicked */}
        {showSettings && (
          <div className="settings-container">
            <h3>Settings</h3>
            <div className="settings-content">
              <p>App settings will be added here.</p>
              {/* You can add actual settings options here */}
            </div>
            <button 
              className="close-btn" 
              onClick={() => setShowSettings(false)}
            >
              Close
            </button>
          </div>
        )}
        
        {/* Contacts list with self-chat option always visible */}
        <div className="contacts-list">
          <h2>Contacts</h2>
          
          {/* Self-chat option always visible */}
          {selfChat && (
            <div 
              key={selfChat._id} 
              className={`contact-item ${activeContact === selfChat._id ? 'active' : ''} self-chat`}
              onClick={() => setActiveContact(selfChat._id)}
            >
              <img src={selfChat.profilePic} alt={selfChat.username} />
              <div className="contact-info">
                <h4>{selfChat.username}</h4>
                <p className="enle-id-text">Enle ID: {selfChat.enleId}</p>
                <p>{selfChat.status}</p>
              </div>
              <div className="contact-status">
                <span className="online-indicator"></span>
              </div>
            </div>
          )}
          
          {/* Regular contacts */}
          {filteredContacts.map(contact => (
            <div 
              key={contact._id} 
              className={`contact-item ${activeContact === contact._id ? 'active' : ''}`}
              onClick={() => setActiveContact(contact._id)}
            >
              <img src={getProfilePicture(contact) || '/default-avatar.png'} alt={contact.username} />
              <div className="contact-info">
                <h4>{contact.username}</h4>
                <p className="enle-id-text">Enle ID: {contact.enleId}</p>
                <p>{contact.status}</p>
              </div>
              <div className="contact-status">
                {isOnline(contact._id) ? (
                  <span className="online-indicator"></span>
                ) : (
                  <span className="offline-indicator"></span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Chat area */}
      <div className="chat-area">
        {activeContact ? (
          <>
            <div className="chat-header">
              <img 
                src={getContactProfilePic(activeContact)} 
                alt={getContactName(activeContact)} 
              />
              <div className="contact-info">
                <h3>{getContactName(activeContact)}</h3>
                <p className="enle-id-text">
                  Enle ID: {getContactEnleId(activeContact)}
                </p>
                <p>
                  {activeContact === user?._id ? 'Always online' : 
                    isOnline(activeContact) ? 'Online' : 'Offline'}
                </p>
              </div>
            </div>
            
            <div className="messages-container">
              {messages.map((message) => (
                <div 
                  key={message._id} 
                  className={`message ${message.sender === user?._id ? 'sent' : 'received'}`}
                >
                  <img 
                    className="message-avatar" 
                    src={getContactProfilePic(message.sender === user?._id ? user?._id : activeContact)} 
                    alt="Avatar" 
                  />
                  <div className="message-content">
                    <p>{message.text}</p>
                    <span className="message-time">
                      {formatTime(message.createdAt)}
                      {message.sender === user?._id && message.read && (
                        <span className="read-status">✓</span>
                      )}
                    </span>
                  </div>
                </div>
              ))}
              
              {typingUsers[activeContact] && (
                <div className="typing-indicator">
                  <p>{getContactName(activeContact)} is typing...</p>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
            
            <form className="message-input" onSubmit={handleSendMessage}>
              <input
                type="text"
                placeholder="Type a message..."
                value={messageText}
                onChange={handleTyping}
              />
              <button type="submit">
                <FaPaperPlane />
              </button>
            </form>
          </>
        ) : (
          <div className="no-chat-selected">
            <h2>Select a contact to start chatting</h2>
          </div>
        )}
      </div>
      
      {/* Logout confirmation dialog */}
      {showLogoutConfirm && (
        <div className="modal-backdrop">
          <Card className="logout-confirm-modal">
            <Card.Body>
              <Card.Title>Confirm Logout</Card.Title>
              <Card.Text>Are you sure you want to logout?</Card.Text>
              <div className="d-flex justify-content-end gap-2">
                <Button variant="secondary" size="sm" onClick={cancelLogout}>Cancel</Button>
                <Button variant="danger" size="sm" onClick={confirmLogout}>Logout</Button>
              </div>
            </Card.Body>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Chat;

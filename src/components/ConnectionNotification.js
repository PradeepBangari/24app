import axios from 'axios';
import React, { useContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { AuthContext } from '../contexts/AuthContext';
import { ChatContext } from '../contexts/ChatContext';
import { useSocket } from '../contexts/SocketContext';
import { Card, Button, ListGroup, Badge } from 'react-bootstrap';
import { FaCheck, FaTimes, FaUserPlus } from 'react-icons/fa';

const ConnectionNotification = () => {
  const [requests, setRequests] = useState([]);
  const socket = useSocket();
  const { refreshContacts } = useContext(ChatContext);
  const { refreshUser, user } = useContext(AuthContext); // Get user as well

  // Fetch pending requests on component mount
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/users/requests', {
            headers: { Authorization: `Bearer ${token}` }
          });
        setRequests(response.data);
      } catch (error) {
        console.error('Error fetching requests:', error);
      }
    };

    fetchRequests();
  }, []);

  // Listen for new connection requests
  useEffect(() => {
    if (!socket) return;

    socket.on('connection_request', (data) => {
      setRequests(prev => [...prev, data]);
      toast.info(`New connection request from ${data.senderUsername}`);
    });

    return () => {
      socket.off('connection_request');
    };
  }, [socket]);

  // Function to send initial message
  const sendInitialMessage = async (recipientId, recipientUsername) => {
    try {
      const token = localStorage.getItem('token');
      const messageData = {
        recipient: recipientId,
        text: `You and ${recipientUsername} are now connected!`
      };
      
      // Make sure we're using the correct endpoint
      const response = await axios.post(
        'http://localhost:5000/api/messages', // Use full URL
        messageData,
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      console.log('Initial message sent:', response.data);
      
      // If socket is available, emit the message event with correct data
      if (socket && user) {
        socket.emit('send_message', {
          ...messageData,
          sender: user._id,
          _id: response.data._id, // Include the message ID from response
          createdAt: response.data.createdAt || new Date().toISOString()
        });
      }
      
      return true;
    } catch (error) {
      console.error('Error sending initial message:', error);
      return false;
    }
  };

  const handleResponse = async (senderId, accept, senderUsername) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `/api/users/requests/${senderId}`,
        { accept },
        { headers: { Authorization: `Bearer ${token}` }}
      );

      setRequests(prev => prev.filter(req => req.senderId !== senderId));
      
      if (accept) {
        await refreshUser(); // Refresh user data first
        await refreshContacts(); // Then refresh contacts
        
        // Send initial message
        await sendInitialMessage(senderId, senderUsername);
        
        toast.success('Connection request accepted and chat initialized');
      } else {
        toast.success('Connection request declined');
      }
    } catch (error) {
      console.error('Error handling request:', error);
      const errorMsg = error.response?.data?.error || 'Failed to process the request';
      toast.error(errorMsg);
    }
  };

  if (requests.length === 0) {
    return (
      <Card className="shadow-sm border-0 mb-3">
        <Card.Header className="bg-primary text-white d-flex align-items-center">
          <FaUserPlus className="me-2" />
          <span>Connection Requests</span>
        </Card.Header>
        <Card.Body className="text-center py-4">
          <p className="text-muted mb-0">No pending connection requests</p>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm border-0 mb-3">
      <Card.Header className="bg-primary text-white d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center">
          <FaUserPlus className="me-2" />
          <span>Connection Requests</span>
        </div>
        <Badge bg="light" text="primary" pill>
          {requests.length}
        </Badge>
      </Card.Header>
      <ListGroup variant="flush">
        {requests.map((request) => (
          <ListGroup.Item key={request.senderId} className="border-bottom">
            <div className="d-flex flex-column">
              <div className="mb-2">
                <h6 className="mb-1 fw-bold">{request.senderUsername}</h6>
                <small className="text-muted d-flex align-items-center">
                  <span className="badge bg-light text-dark me-1">ID:</span>
                  {request.senderEnleId}
                </small>
              </div>
              <div className="d-flex gap-2 mt-1">
                <Button
                  variant="success"
                  size="sm"
                  className="d-flex align-items-center"
                  onClick={() => handleResponse(request.senderId, true, request.senderUsername)}
                >
                  <FaCheck className="me-1" /> Accept
                </Button>
                <Button
                  variant="outline-danger"
                  size="sm"
                  className="d-flex align-items-center"
                  onClick={() => handleResponse(request.senderId, false)}
                >
                  <FaTimes className="me-1" /> Decline
                </Button>
              </div>
            </div>
          </ListGroup.Item>
        ))}
      </ListGroup>
    </Card>
  );
};

export default ConnectionNotification;

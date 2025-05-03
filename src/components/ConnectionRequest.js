import axios from 'axios';
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { Form, Button, InputGroup, Card } from 'react-bootstrap';
import { FaUserPlus } from 'react-icons/fa';

const ConnectionRequest = ({ onClose }) => {
  const [enleId, setEnleId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate input
    if (!enleId || enleId.length !== 6 || !/^\d+$/.test(enleId)) {
      toast.error('Please enter a valid 6-digit Enle ID');
      return;
    }
    
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        '/api/users/requests',  // Use relative path
        { enleId },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      toast.success('Connection request sent successfully');
      setEnleId('');
      if (onClose) onClose(); // Close the form if onClose is provided
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Failed to send connection request';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="connection-request shadow-sm border-0">
      <Card.Body>
        <Card.Title className="text-center mb-3">
          <FaUserPlus className="me-2" />
          Add New Contact
        </Card.Title>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Enle ID</Form.Label>
            <InputGroup>
              <Form.Control
                type="text"
                placeholder="Enter 6-digit Enle ID"
                value={enleId}
                onChange={(e) => setEnleId(e.target.value)}
                maxLength={6}
                pattern="\d{6}"
                required
                className="border-end-0"
              />
              <InputGroup.Text className="bg-white border-start-0">
                <small className="text-muted">6 digits</small>
              </InputGroup.Text>
            </InputGroup>
            <Form.Text className="text-muted">
              Enter Enle ID of the person you want to connect with.
            </Form.Text>
          </Form.Group>
          <div className="d-grid gap-2">
            <Button 
              variant="primary" 
              type="submit" 
              disabled={loading}
              className="mb-2"
            >
              {loading ? 'Sending...' : 'Send Connection Request'}
            </Button>
            <Button 
              variant="outline-secondary" 
              onClick={onClose}
              type="button"
            >
              Cancel
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default ConnectionRequest;
import React from 'react';
import './SuccessModal.css';

const SuccessModal = ({ isOpen, onClose, title, message, enleId, username }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="success-modal">
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="success-icon">✓</div>
          <h3>Welcome, {username}!</h3>
          <p>{message}</p>
          <div className="enle-id-container">
            <p>Your Enle ID:</p>
            <div className="enle-id-box">{enleId}</div>
            <p className="enle-id-note">Please save this ID as you'll need it to connect with friends.</p>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-primary" onClick={onClose}>Continue to Chat</button>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;
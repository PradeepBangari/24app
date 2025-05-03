import axios from 'axios'; // Make sure axios is installed
import React, { useContext, useRef, useState } from 'react';
import { FaEye, FaEyeSlash, FaPaperPlane } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import SuccessModal from '../components/SuccessModal';
import { AuthContext } from '../contexts/AuthContext';
import './Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    otp: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [registrationData, setRegistrationData] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Store the generated OTP in a ref so it persists between renders
  const generatedOtpRef = useRef('');
  
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  // Toggle confirm password visibility
  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };
  
  // Generate a random 6-digit OTP
  const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };
  
  // Function to send OTP
  const sendOTP = async (e) => {
    e.preventDefault();
    
    // Validate email
    if (!formData.email) {
      setError('Please enter your email address');
      return;
    }
    
    // Email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    setOtpLoading(true);
    setError('');
    
    try {
      // Generate a new OTP
      const newOtp = generateOTP();
      generatedOtpRef.current = newOtp;
      
      // Send OTP via email
      const response = await axios.post('/api/send-otp', { 
        email: formData.email,
        otp: newOtp,
        username: formData.username || 'User'
      });
      
      if (response.data.success) {
        setOtpSent(true);
        setError('');
      } else {
        setError(response.data.message || 'Failed to send OTP');
      }
    } catch (err) {
      console.error('OTP sending error:', err);
      setError('Failed to send OTP. Please try again.');
    } finally {
      setOtpLoading(false);
    }
  };
  
  // Function to verify OTP
  const verifyOTP = () => {
    if (!formData.otp) {
      setError('Please enter the OTP sent to your email');
      return false;
    }
    
    if (formData.otp === generatedOtpRef.current) {
      setOtpVerified(true);
      return true;
    } else {
      setError('Invalid OTP. Please check and try again.');
      return false;
    }
  };
  
  // Function to resend OTP
  const resendOTP = async () => {
    setOtpLoading(true);
    setError('');
    
    try {
      // Generate a new OTP
      const newOtp = generateOTP();
      generatedOtpRef.current = newOtp;
      
      // Send OTP via email
      const response = await axios.post('/api/send-otp', { 
        email: formData.email,
        otp: newOtp,
        username: formData.username || 'User'
      });
      
      if (response.data.success) {
        setError('');
        // Show success message
        alert('OTP resent to your email!');
      } else {
        setError(response.data.message || 'Failed to resend OTP');
      }
    } catch (err) {
      console.error('OTP resending error:', err);
      setError('Failed to resend OTP. Please try again.');
    } finally {
      setOtpLoading(false);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }
    
    // Check if OTP has been sent
    if (!otpSent) {
      return setError('Please verify your email with OTP first');
    }
    
    // Verify OTP if not already verified
    if (!otpVerified) {
      const isVerified = verifyOTP();
      if (!isVerified) return;
    }
    
    setLoading(true);
    
    try {
      // Remove confirmPassword and otp before sending
      const { confirmPassword, otp, ...registerData } = formData;
      const response = await register(registerData);
      
      // Store registration data and show modal
      setRegistrationData(response.user);
      setShowModal(true);
    } catch (err) {
      setError(err.error || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };
  
  const handleModalClose = () => {
    setShowModal(false);
    navigate('/chat');
  };
  
  const navigateToLogin = () => {
    navigate('/login');
  };
  
  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title text-center"> ಎನ್ಲೆ</h1>
        <h1 className="auth-title text-center">24 WebChat App</h1>
        <h4 className="auth-subtitle text-center">Create an Account</h4>
        
        {error && <div className="alert alert-danger">{error}</div>}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="mb-3">
            <label className="form-label">Username</label>
            <input
              type="text"
              className="form-control"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              placeholder="Choose a username"
            />
          </div>
          
          <div className="mb-3">
            <label className="form-label">Email</label>
            <div className="input-group">
              <input
                type="email"
                className="form-control"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Enter your email"
                disabled={otpSent} // Disable after OTP is sent
              />
              <button 
                className="btn btn-outline-primary d-flex align-items-center" 
                type="button"
                onClick={otpSent ? resendOTP : sendOTP}
                disabled={otpLoading}
              >
                {otpLoading ? (
                  <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                ) : (
                  <FaPaperPlane className="me-1" />
                )}
                {otpSent ? (otpLoading ? 'Sending...' : 'Resend OTP') : (otpLoading ? 'Sending...' : 'Send OTP')}
              </button>
            </div>
          </div>
          
          {otpSent && (
            <div className="mb-3">
              <label className="form-label">OTP Verification</label>
              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  name="otp"
                  value={formData.otp}
                  onChange={handleChange}
                  required
                  placeholder="Enter 6-digit OTP"
                  maxLength="6"
                  pattern="\d{6}"
                  disabled={otpVerified}
                />
                {!otpVerified && (
                  <button 
                    className="btn btn-outline-success" 
                    type="button"
                    onClick={verifyOTP}
                  >
                    Verify
                  </button>
                )}
              </div>
              {otpVerified ? (
                <small className="text-success">Email verified successfully!</small>
              ) : (
                <small className="text-muted">Enter the 6-digit code sent to your email</small>
              )}
            </div>
          )}
          
          <div className="mb-3">
            <label className="form-label">Password</label>
            <div className="password-input-container position-relative">
              <input
                type={showPassword ? "text" : "password"}
                className="form-control"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength="6"
                placeholder="Create a password"
              />
              <button 
                type="button" 
                className="password-toggle-btn" 
                onClick={togglePasswordVisibility}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>
          
          <div className="mb-3">
            <label className="form-label">Confirm Password</label>
            <div className="password-input-container position-relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                className="form-control"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                minLength="6"
                placeholder="Confirm your password"
              />
              <button 
                type="button" 
                className="password-toggle-btn" 
                onClick={toggleConfirmPasswordVisibility}
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>
          
          <button type="submit" className="btn auth-btn w-100" disabled={loading}>
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>
        
        <p className="mt-4 text-center">
          Already have an account? 
          <button 
            onClick={navigateToLogin} 
            className="auth-link"
          >
            Login
          </button>
        </p>
      </div>
      
      {/* Success Modal */}
      {registrationData && (
        <SuccessModal
          isOpen={showModal}
          onClose={handleModalClose}
          title="Registration Successful"
          message="Your account has been created successfully!"
          enleId={registrationData.enleId}
          username={registrationData.username}
        />
      )}
    </div>
  );
};

export default Register;
import React, { useContext, useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa'; // Import eye icons
import { useNavigate } from 'react-router-dom';
import SuccessModal from '../components/SuccessModal';
import { AuthContext } from '../contexts/AuthContext';
import './Auth.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [userData, setUserData] = useState(null);
  const [showPassword, setShowPassword] = useState(false); // Add state for password visibility
  
  const { login } = useContext(AuthContext);

  const navigate = useNavigate();
  
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const response = await login(formData);
      setUserData(response.user);
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
  
  const navigateToRegister = () => {
    navigate('/register');
  };
  
  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title text-center">ಎನ್ಲೆ</h1>
        <h1 className="auth-title text-center">24 WebChat App</h1>
        <h4 className="auth-subtitle text-center">Welcome Back</h4>
        
        {error && <div className="alert alert-danger">{error}</div>}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
            />
          </div>
          
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
                placeholder="Enter your password"
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
          
          <button type="submit" className="btn auth-btn w-100" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        
        <p className="mt-4 text-center">
          Don't have an account?
          <button 
            onClick={navigateToRegister} 
            className="auth-link"
          >
            Register
          </button>
        </p>
      </div>
      
      {/* Success Modal */}
      {userData && (
        <SuccessModal
          isOpen={showModal}
          onClose={handleModalClose}
          title="Login Successful"
          message="You have successfully logged in!"
          enleId={userData.enleId}
          username={userData.username}
        />
      )}
    </div>
  );
};

export default Login;

import axios from 'axios';
import React, { createContext, useEffect, useState } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setLoading(false);
        return;
      }
      
      try {
        // Set default headers for all requests
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        const res = await axios.get('http://localhost:5000/api/users/profile');
        setUser(res.data);
      } catch (error) {
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
      }
      
      setLoading(false);
    };
    
    loadUser();
  }, []);
  
  // Register user
  const register = async (userData) => {
    try {
      const res = await axios.post('http://localhost:5000/api/users/register', userData);
      
      localStorage.setItem('token', res.data.token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
      
      setUser(res.data.user);
      return res.data;
    } catch (error) {
      throw error.response.data;
    }
  };
  
  // Login user
  const login = async (userData) => {
    try {
      const res = await axios.post('http://localhost:5000/api/users/login', userData);
      
      localStorage.setItem('token', res.data.token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
      
      setUser(res.data.user);
      return res.data;
    } catch (error) {
      throw error.response.data;
    }
  };
  
  // Logout user
  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };
  
  // Add this function to refresh user data
  const refreshUser = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/users/profile');
      setUser(res.data);
      return res.data;
    } catch (error) {
      console.error('Error refreshing user data:', error);
      return null;
    }
  };
  
  // Include it in the context value
  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        register,
        login,
        logout,
        refreshUser // Make sure this is included
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
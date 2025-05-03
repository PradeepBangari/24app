import React, { useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom'; // Remove BrowserRouter import
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import io from 'socket.io-client';
import Chat from './pages/Chat';
import Login from './pages/Login';
import Register from './pages/Register';

// Context
import { AuthProvider } from './contexts/AuthContext';
import { ChatProvider } from './contexts/ChatContext';
import { SocketProvider } from './contexts/SocketContext';

// Private route component
const PrivateRoute = ({ component: Component, ...rest }) => {
  const token = localStorage.getItem('token');
  return token ? <Component {...rest} /> : <Navigate to="/login" />;
};

function App() {
  const [socket, setSocket] = useState(null);
  
  useEffect(() => {
    // Connect to WebSocket server
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);
    
    return () => newSocket.close();
  }, []);
  
  return (
    <div className="App"> 
      <ToastContainer />
      <SocketProvider socket={socket}>
        <AuthProvider>
          <ChatProvider socket={socket}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/chat" element={<PrivateRoute component={Chat} />} />
              <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
          </ChatProvider>
        </AuthProvider>
      </SocketProvider>
    </div>
  );
}

export default App;
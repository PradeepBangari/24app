import React, { createContext, useContext } from 'react';

const SocketContext = createContext(null);

export const SocketProvider = ({ children, socket }) => {
  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
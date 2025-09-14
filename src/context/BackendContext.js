import React, { createContext, useState, useContext } from 'react';

const BackendContext = createContext();

export const useBackend = () => useContext(BackendContext);

export const BackendProvider = ({ children }) => {
  // Backend configurations
  const backends = {
    backend1: {
      id: 'backend1',
      name: 'Backend 1',
      pythonUrl: process.env.REACT_APP_PYTHON_API_URL || 'http://localhost:5001',
      prodPythonUrl: 'https://qudemo-python-backend.onrender.com',
      description: 'Production Backend'
    },
    backend2: {
      id: 'backend2', 
      name: 'Backend 2',
      pythonUrl: process.env.REACT_APP_PYTHON_API_URL_2 || 'http://localhost:5002',
      prodPythonUrl: 'https://qudemo-python-backend-2.onrender.com',
      description: 'Testing Backend'
    }
  };

  // Get initial backend from localStorage or default to backend1
  const [selectedBackend, setSelectedBackend] = useState(() => {
    const saved = localStorage.getItem('selectedBackend');
    return saved && backends[saved] ? saved : 'backend1';
  });

  // Get current backend configuration
  const getCurrentBackend = () => {
    return backends[selectedBackend];
  };

  // Get Python API URL for current backend
  const getPythonApiUrl = () => {
    const backend = getCurrentBackend();
    return backend.pythonUrl || backend.prodPythonUrl;
  };

  // Switch backend
  const switchBackend = (backendId) => {
    if (backends[backendId]) {
      setSelectedBackend(backendId);
      localStorage.setItem('selectedBackend', backendId);
      console.log(`🔄 Switched to ${backends[backendId].name}`);
    }
  };

  // Get all available backends
  const getAvailableBackends = () => {
    return Object.values(backends);
  };

  const value = {
    selectedBackend,
    currentBackend: getCurrentBackend(),
    pythonApiUrl: getPythonApiUrl(),
    switchBackend,
    getAvailableBackends,
    backends
  };

  return (
    <BackendContext.Provider value={value}>
      {children}
    </BackendContext.Provider>
  );
};

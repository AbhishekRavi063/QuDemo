import React from 'react';
import { getNodeApiUrl, getVideoApiUrl } from '../config/api';

const ApiDebug = () => {
  const nodeApiUrl = getNodeApiUrl('/api/auth/register');
  const videoApiUrl = getVideoApiUrl('/health');
  
  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      right: '10px', 
      background: 'rgba(0,0,0,0.8)', 
      color: 'white', 
      padding: '10px', 
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 9999,
      maxWidth: '300px'
    }}>
      <h4>API Debug Info:</h4>
      <div><strong>NODE_ENV:</strong> {process.env.NODE_ENV}</div>
      <div><strong>REACT_APP_NODE_API_URL:</strong> {process.env.REACT_APP_NODE_API_URL}</div>
      <div><strong>REACT_APP_PYTHON_API_URL:</strong> {process.env.REACT_APP_PYTHON_API_URL}</div>
      <div><strong>Node API URL:</strong> {nodeApiUrl}</div>
      <div><strong>Video API URL:</strong> {videoApiUrl}</div>
    </div>
  );
};

export default ApiDebug;

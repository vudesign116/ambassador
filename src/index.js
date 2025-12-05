import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Debug: Log to verify React is running
console.log('🚀 React app starting...');
console.log('📍 Root element:', document.getElementById('root'));

const root = ReactDOM.createRoot(document.getElementById('root'));

// Debug: Add a simple test to verify rendering works
console.log('✅ React root created');

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

console.log('✅ App rendered');
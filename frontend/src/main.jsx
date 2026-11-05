import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// Ensure browser stays permanently on clean corporate light theme
try {
  document.documentElement.classList.remove('dark');
  document.documentElement.classList.add('light');
  document.body.classList.remove('dark');
  document.body.classList.add('light');
  document.body.style.backgroundColor = '#ffffff';
  document.body.style.color = '#0f172a';
  localStorage.removeItem('riskradar_theme');
} catch (e) {
  // Ignore in non-browser envs
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

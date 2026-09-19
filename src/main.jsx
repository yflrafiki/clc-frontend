import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { MembersProvider } from './context/MembersContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <MembersProvider>
        <Toaster position="top-right" />
        <App />
      </MembersProvider>
    </AuthProvider>
  </React.StrictMode>
);

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css' // Ensure this is imported first for global styles
import App from './App.jsx'

// Force CSS reload for production
if (import.meta.env.PROD) {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = '/assets/index.css'; // This will match whatever name Vite generates
  document.head.appendChild(link);
  
  console.log('Production CSS loaded');
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

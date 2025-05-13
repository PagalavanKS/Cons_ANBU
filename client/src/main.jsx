import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css' // Ensure this is imported first for global styles
import App from './App.jsx'

// Force CSS reload for production - using the correct path for assets now
if (import.meta.env.PROD) {
  // Get the dynamic CSS filename from the document
  const cssLinks = document.querySelectorAll('link[rel="stylesheet"]');
  const cssPath = cssLinks.length > 0 ? cssLinks[0].getAttribute('href') : '/assets/index.css';
  
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = cssPath;
  document.head.appendChild(link);
  
  console.log('Production CSS loaded from:', cssPath);
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css' // Base CSS with variables and utility classes
import './App.css'   // Component-specific styling
import App from './App.jsx'

// Force CSS reload for production
if (import.meta.env.PROD) {
  // Get all CSS files
  const cssLinks = document.querySelectorAll('link[rel="stylesheet"]');
  
  // Create links for our CSS files if they don't exist
  if (cssLinks.length === 0) {
    const indexCss = document.createElement('link');
    indexCss.rel = 'stylesheet';
    indexCss.href = '/assets/index.css';
    document.head.appendChild(indexCss);
    
    const appCss = document.createElement('link');
    appCss.rel = 'stylesheet';
    appCss.href = '/assets/app.css';
    document.head.appendChild(appCss);
    
    console.log('Production CSS loaded manually');
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

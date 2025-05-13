import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css' // Ensure this is imported first
import App from './App.jsx'

// Add this to log whether styles are being loaded
console.log('Styles should be loaded now')

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

/**
 * Main Application Entry Point
 * 
 * This file is the starting point of our React application.
 * It's responsible for:
 * 1. Importing the necessary React libraries
 * 2. Importing global CSS styles
 * 3. Importing our top-level App component
 * 4. Mounting the App component to the DOM
 */

// Import React APIs we need
import { StrictMode } from 'react'  // Helps catch bugs by highlighting potential problems
import { createRoot } from 'react-dom/client'  // Modern React 18 way to render components

// Import global CSS styles
import './index.css'

// Import our main App component
import App from './App.jsx'

// ----------- Application Initialization -----------

// 1. Find the DOM element with id="root" from our index.html file
// 2. Create a React root at this element
// 3. Render our App component inside this root
createRoot(document.getElementById('root')).render(
  // StrictMode is a development tool that:
  // - Highlights potential problems in the application
  // - Doesn't render any visible UI
  // - Renders components twice in development to detect side effects
  <StrictMode>
    <App />
  </StrictMode>,
)

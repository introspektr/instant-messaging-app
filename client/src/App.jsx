import './App.css'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Chat from './pages/Chat'
import PropTypes from 'prop-types'

/**
 * Protected Route Component
 * 
 * Ensures that only authenticated users can access certain routes.
 * Redirects to the login page if no authentication token is found.
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render when authenticated
 * @returns {React.ReactElement} The protected route or a redirect
 */
const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('token')
    if (!token) {
        return <Navigate to="/login" replace />
    }
    return children
}

// Add prop types validation
ProtectedRoute.propTypes = {
    children: PropTypes.node.isRequired,
};

/**
 * Main Application Component
 * 
 * Sets up routing for the application with the following routes:
 * - / - Redirects to /login
 * - /signup - Registration page
 * - /login - Authentication page
 * - /chat - Main chat interface (protected, requires authentication)
 * 
 * @returns {React.ReactElement} The application with routing
 */
function App() {
  return (
    <Router>
      <Routes>
        {/* Redirect root path to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route 
          path="/chat" 
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  )
}

export default App

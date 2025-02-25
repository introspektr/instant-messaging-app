// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import './App.css'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Chat from './pages/Chat'
import PropTypes from 'prop-types'

// Protected Route component
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

function App() {
  return (
    <Router>
      <Routes>
        {/* Redirect root path to signup */}
        <Route path="/" element={<Navigate to="/signup" replace />} />
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

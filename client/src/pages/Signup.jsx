import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/Signup.css';
import blabLogo from '../assets/blab-logo.svg';

/**
 * Signup Page Component
 * 
 * This component renders a form for user registration with fields for:
 * - Username
 * - Email
 * - Password
 * - Password confirmation
 * 
 * It handles form validation, API requests to register users, and
 * redirects to the login page upon successful registration.
 * 
 * @returns {React.ReactElement} The signup form and page
 */
const Signup = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');

    /**
     * Updates form data state when input fields change
     * 
     * @param {Event} e - The input change event
     */
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    /**
     * Handles form submission, validation, and API request
     * 
     * @param {Event} e - The form submission event
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Password validation
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        // Prepare request
        try {
            const response = await fetch('http://localhost:8747/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: formData.username,
                    email: formData.email,
                    password: formData.password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Registration failed');
            }

            if (!data.success) {
                throw new Error(data.message || 'Registration failed');
            }

            // Success - redirect to login
            navigate('/login');
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="signup-container">
            <div className="signup-card">
                <div className="logo-container">
                    <img src={blabLogo} alt="Blab Logo" className="logo" />
                    <h1>Blab</h1>
                </div>
                <h2>Create your Blab account</h2>
                
                {error && <div className="error-message" role="alert">{error}</div>}
                
                <form onSubmit={handleSubmit} role="form">
                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            minLength="6"
                        />
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    
                    <button type="submit" className="signup-button">Sign Up</button>
                </form>
                
                <div className="login-link">
                    Already have an account? <Link to="/login">Login</Link>
                </div>
            </div>
        </div>
    );
};

export default Signup; 
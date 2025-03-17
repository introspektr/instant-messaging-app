import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/Login.css';
import blabLogo from '../assets/blab-logo.svg';

/**
 * Login Page Component
 * 
 * This component renders a form for user authentication with fields for:
 * - Email
 * - Password
 * 
 * It handles form validation, API requests to authenticate users, stores
 * the authentication token in local storage, and redirects to the chat
 * page upon successful login.
 * 
 * @returns {React.ReactElement} The login form and page
 */
const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

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
     * Toggles password visibility
     */
    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    /**
     * Handles form submission, validation, and API request
     * 
     * @param {Event} e - The form submission event
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        try {
            const response = await fetch('http://localhost:8747/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Invalid credentials');
            }

            if (!data.success) {
                throw new Error(data.message || 'Login failed');
            }

            // Store the token and user info - adjusted for new response format
            localStorage.setItem('token', data.data.token);
            localStorage.setItem('userId', data.data.user.id);
            localStorage.setItem('username', data.data.user.username);
            
            // Redirect to chat page
            navigate('/chat');
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="logo-container">
                    <img src={blabLogo} alt="Blab Logo" className="logo" />
                    <h1>Blab</h1>
                </div>
                <h2>Login and start Blabbering</h2>
                
                {error && <div className="error-message" role="alert">{error}</div>}
                
                <form onSubmit={handleSubmit} role="form" className="login-form">
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
                        <div className="password-input-container">
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                            <button 
                                type="button" 
                                className="toggle-password"
                                onClick={togglePasswordVisibility}
                                aria-label={showPassword ? "Hide password" : "Show password"}
                                title={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? "👁️" : "👁️‍🗨️"}
                            </button>
                        </div>
                    </div>
                    
                    <button type="submit" className="login-button">Login</button>
                </form>
                
                <div className="signup-link">
                    Don&apos;t have an account? <Link to="/signup">Sign up</Link>
                </div>
            </div>
        </div>
    );
};

export default Login; 
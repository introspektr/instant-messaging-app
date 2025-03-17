import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/Signup.css';
import blabLogo from '../assets/blab-logo.svg';

/**
 * Signup Page Component
 * 
 * This component renders a form for user registration with fields for:
 * - Username
 * - First Name
 * - Last Name
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
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
     * 
     * @param {string} field - The password field to toggle ('password' or 'confirmPassword')
     */
    const togglePasswordVisibility = (field) => {
        if (field === 'password') {
            setShowPassword(!showPassword);
        } else {
            setShowConfirmPassword(!showConfirmPassword);
        }
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
                    firstName: formData.firstName,
                    lastName: formData.lastName,
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
                
                <form onSubmit={handleSubmit} role="form" className="signup-form">
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
                    
                    <div className="form-row">
                        <div className="form-group half">
                            <label htmlFor="firstName">First Name</label>
                            <input
                                type="text"
                                id="firstName"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                            />
                        </div>
                        
                        <div className="form-group half">
                            <label htmlFor="lastName">Last Name</label>
                            <input
                                type="text"
                                id="lastName"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                            />
                        </div>
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
                    
                    <div className="form-row">
                        <div className="form-group half">
                            <label htmlFor="password">Password</label>
                            <div className="password-input-container">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    minLength="6"
                                />
                                <button 
                                    type="button" 
                                    className="toggle-password"
                                    onClick={() => togglePasswordVisibility('password')}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                    title={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? "👁️" : "👁️‍🗨️"}
                                </button>
                            </div>
                        </div>
                        
                        <div className="form-group half">
                            <label htmlFor="confirmPassword">Confirm Password</label>
                            <div className="password-input-container">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                />
                                <button 
                                    type="button" 
                                    className="toggle-password"
                                    onClick={() => togglePasswordVisibility('confirmPassword')}
                                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                                    title={showConfirmPassword ? "Hide password" : "Show password"}
                                >
                                    {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
                                </button>
                            </div>
                        </div>
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
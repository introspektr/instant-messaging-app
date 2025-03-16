import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { memo } from 'react';
import '../styles/Signup.css';  // Adjust the path as necessary

/**
 * SignupForm Component
 * 
 * This component provides a form for users to create a new account.
 * It handles form submission, validation, and user registration API calls.
 * On successful signup, it navigates to the login page.
 * 
 * @param {Object} props - Component props
 * @param {Function} [props.onSignupSuccess] - Optional callback function called after successful signup
 */
const SignupForm = ({ onSignupSuccess }) => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setIsLoading(true);

        if (!formData.username.trim() || !formData.email.trim() || 
            !formData.password.trim() || !formData.confirmPassword.trim()) {
            setError('All fields are required');
            setIsLoading(false);
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setIsLoading(false);
            return;
        }

        if (formData.password.length < 8) {
            setError('Password must be at least 8 characters long');
            setIsLoading(false);
            return;
        }

        try {
            const apiData = {
                username: formData.username,
                email: formData.email,
                password: formData.password
            };

            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(apiData)
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Signup failed. Please try again.');
            }

            if (onSignupSuccess) {
                onSignupSuccess(data);
            }

            navigate('/login');
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="signup-form">
            <div className="form-group">
                <label htmlFor="username">Username</label>
                <input 
                    id="username"
                    type="text" 
                    name="username" 
                    value={formData.username} 
                    onChange={handleChange} 
                    required 
                    disabled={isLoading}
                    aria-describedby={error ? "signup-error" : undefined}
                />
            </div>
            <div className="form-group">
                <label htmlFor="email">Email</label>
                <input 
                    id="email"
                    type="email" 
                    name="email" 
                    value={formData.email} 
                    onChange={handleChange} 
                    required 
                    disabled={isLoading}
                    aria-describedby={error ? "signup-error" : undefined}
                />
            </div>
            <div className="form-group">
                <label htmlFor="password">Password</label>
                <input 
                    id="password"
                    type="password" 
                    name="password" 
                    value={formData.password} 
                    onChange={handleChange} 
                    required 
                    disabled={isLoading}
                    aria-describedby={error ? "signup-error" : undefined}
                />
                <small className="password-hint">At least 8 characters long</small>
            </div>
            <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input 
                    id="confirmPassword"
                    type="password" 
                    name="confirmPassword" 
                    value={formData.confirmPassword} 
                    onChange={handleChange} 
                    required 
                    disabled={isLoading}
                    aria-describedby={error ? "signup-error" : undefined}
                />
            </div>
            {error && <div id="signup-error" className="error-message" role="alert">{error}</div>}
            <button type="submit" disabled={isLoading}>
                {isLoading ? 'Signing up...' : 'Sign Up'}
            </button>
        </form>
    );
};

SignupForm.propTypes = {
    onSignupSuccess: PropTypes.func
};

export default memo(SignupForm); 
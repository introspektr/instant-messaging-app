import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { memo } from 'react';

/**
 * LoginForm Component
 * 
 * This component provides a form for users to log in to the application.
 * It handles form submission, validation, and authentication API calls.
 * On successful login, it stores the auth token and navigates to the chat page.
 * 
 * @param {Object} props - Component props
 * @param {Function} [props.onLoginSuccess] - Optional callback function called after successful login
 */
const LoginForm = ({ onLoginSuccess }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    /**
     * Handle form submission
     * Validates inputs and makes API call to login
     * 
     * @param {Event} event - The form submission event
     */
    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setIsLoading(true);

        if (!email.trim() || !password.trim()) {
            setError('All fields are required');
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Login failed. Please check your credentials.');
            }

            localStorage.setItem('token', data.token);
            
            if (onLoginSuccess) {
                onLoginSuccess(data);
            }
            
            navigate('/chat');
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
                <label htmlFor="email">Email</label>
                <input 
                    id="email"
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                    disabled={isLoading}
                    aria-describedby={error ? "login-error" : undefined}
                />
            </div>
            <div className="form-group">
                <label htmlFor="password">Password</label>
                <input 
                    id="password"
                    type="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                    disabled={isLoading}
                    aria-describedby={error ? "login-error" : undefined}
                />
            </div>
            {error && <div id="login-error" className="error-message" role="alert">{error}</div>}
            <button type="submit" disabled={isLoading}>
                {isLoading ? 'Logging in...' : 'Login'}
            </button>
        </form>
    );
};

LoginForm.propTypes = {
    onLoginSuccess: PropTypes.func
};

export default memo(LoginForm); 
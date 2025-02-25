import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Signup.css';  // Adjust the path as necessary

const SignupForm = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Signup failed');
            }

            navigate('/login');
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label>Username</label>
                <input type="text" name="username" value={formData.username} onChange={handleChange} required />
            </div>
            <div>
                <label>Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} required />
            </div>
            <div>
                <label>Password</label>
                <input type="password" name="password" value={formData.password} onChange={handleChange} required />
            </div>
            <div>
                <label>Confirm Password</label>
                <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required />
            </div>
            {error && <div>{error}</div>}
            <button type="submit">Sign Up</button>
        </form>
    );
};

export default SignupForm; 
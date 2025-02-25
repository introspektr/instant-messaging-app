import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LoginForm = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Login failed');
            }

            localStorage.setItem('token', data.token);
            navigate('/chat');
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label>Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
                <label>Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            {error && <div>{error}</div>}
            <button type="submit">Login</button>
        </form>
    );
};

export default LoginForm; 
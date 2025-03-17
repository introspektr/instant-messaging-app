import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import blabLogo from '../assets/blab-logo.svg';
import '../styles/Profile.css';

/**
 * Profile Page Component
 * 
 * This component renders a form for users to update their profile information:
 * - First Name
 * - Last Name
 * 
 * It fetches the current user data and allows them to update their profile.
 * 
 * @returns {React.ReactElement} The profile form and page
 */
const Profile = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: ''
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Fetch user data on component mount
    useEffect(() => {
        const fetchUserData = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            try {
                const response = await fetch('/api/auth/me', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || 'Failed to fetch user data');
                }

                setFormData({
                    firstName: data.data.user.firstName || '',
                    lastName: data.data.user.lastName || ''
                });
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchUserData();
    }, [navigate]);

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
        setSuccess('');

        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        try {
            const response = await fetch('/api/auth/profile', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    firstName: formData.firstName,
                    lastName: formData.lastName
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to update profile');
            }

            setSuccess('Profile updated successfully');
            
            // Update the user data in localStorage if available
            const userStr = localStorage.getItem('user');
            if (userStr) {
                try {
                    const user = JSON.parse(userStr);
                    user.firstName = formData.firstName;
                    user.lastName = formData.lastName;
                    localStorage.setItem('user', JSON.stringify(user));
                } catch (err) {
                    console.error('Failed to update localStorage user data:', err);
                }
            }
        } catch (err) {
            setError(err.message);
        }
    };

    if (loading) {
        return (
            <div className="profile-container">
                <div className="profile-card loading">
                    <div className="logo-container">
                        <img src={blabLogo} alt="Blab Logo" className="logo" />
                        <h1>Blab</h1>
                    </div>
                    <div className="loading-message">Loading your profile...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="profile-container">
            <div className="profile-card">
                <div className="logo-container">
                    <img src={blabLogo} alt="Blab Logo" className="logo" />
                    <h1>Blab</h1>
                </div>
                
                <h2>Update Your Profile</h2>
                
                {error && <div className="error-message" role="alert">{error}</div>}
                {success && <div className="success-message" role="status">{success}</div>}
                
                <form onSubmit={handleSubmit} role="form">
                    <div className="form-group">
                        <label htmlFor="firstName">First Name</label>
                        <input
                            type="text"
                            id="firstName"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            placeholder="Enter your first name"
                        />
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="lastName">Last Name</label>
                        <input
                            type="text"
                            id="lastName"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            placeholder="Enter your last name"
                        />
                    </div>
                    
                    <button type="submit" className="update-button">Update Profile</button>
                </form>
                
                <div className="back-link">
                    <button 
                        onClick={() => navigate('/chat')} 
                        className="back-button"
                    >
                        Back to Chat
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Profile; 
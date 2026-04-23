import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import PublicNavbar from '../components/PublicNavbar';

const Register = () => {
    const navigate = useNavigate();
    const { user, checkAuth } = useAuth();

    useEffect(() => {
        if (user) {
            switch (user.role) {
                case 'ROLE_ADMIN':
                    navigate('/admin-dashboard');
                    break;
                case 'ROLE_TECHNICIAN':
                    navigate('/technician-dashboard');
                    break;
                case 'ROLE_USER':
                default:
                    navigate('/user-dashboard');
                    break;
            }
        }
    }, [user, navigate]);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        mobile: '',
        nic: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await api.post('/auth/register', formData);
            // On success, automatically log in
            await api.post('/auth/login', { email: formData.email, password: formData.password });
            await checkAuth(); // Refresh the user context, which will trigger the useEffect redirection
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <PublicNavbar />
            <div className="login-page">
            <div className="glass-panel login-card">
                <h1 className="login-title">Create an Account</h1>
                <p className="login-subtitle">Sign up to get started</p>
                
                {error && <div style={{ color: '#ff4d4f', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <input
                            type="text"
                            name="name"
                            placeholder="Full Name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="auth-input"
                        />
                    </div>
                    <div>
                        <input
                            type="email"
                            name="email"
                            placeholder="Email Address"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="auth-input"
                        />
                    </div>
                    <div>
                        <input
                            type="password"
                            name="password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            className="auth-input"
                        />
                    </div>
                    <div>
                        <input
                            type="text"
                            name="mobile"
                            placeholder="Mobile Number"
                            value={formData.mobile}
                            onChange={handleChange}
                            required
                            className="auth-input"
                        />
                    </div>
                    <div>
                        <input
                            type="text"
                            name="nic"
                            placeholder="NIC Number"
                            value={formData.nic}
                            onChange={handleChange}
                            required
                            className="auth-input"
                        />
                    </div>
                    
                    <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', marginTop: '0.5rem' }}>
                        {loading ? 'Registering...' : 'Register'}
                    </button>
                </form>

                <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                    <p>Already have an account? <Link to="/login" style={{ color: '#007bff', textDecoration: 'none' }}>Log In</Link></p>
                </div>
                </div>
            </div>
        </>
    );
};

export default Register;

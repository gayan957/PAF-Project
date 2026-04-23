import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const Login = () => {
    const { user, loading, checkAuth } = useAuth();
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (user) {
            // Redirect based on role
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

    const handleGoogleLogin = () => {
        window.location.href = 'http://localhost:8080/oauth2/authorization/google';
    };
    
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleManualLogin = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);
        
        try {
            await api.post('/auth/login', formData);
            await checkAuth(); // Refreshes the user context
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid email or password');
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="full-page-loader">
            <div className="loader"></div>
            <p>Loading...</p>
        </div>
    );

    return (
        <div className="login-page">
            <div className="glass-panel login-card">
                <h1 className="login-title">Welcome Back</h1>
                <p className="login-subtitle">Sign in to access your portal</p>
                
                {error && <div style={{ color: '#ff4d4f', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}

                <form onSubmit={handleManualLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div>
                        <input
                            type="email"
                            name="email"
                            placeholder="Email Address"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ccc' }}
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
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ccc' }}
                        />
                    </div>
                    
                    <button type="submit" className="btn btn-primary" disabled={submitting} style={{ width: '100%' }}>
                        {submitting ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <div style={{ display: 'flex', alignItems: 'center', margin: '1rem 0' }}>
                    <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }}></div>
                    <span style={{ margin: '0 10px', color: '#64748b', fontSize: '0.875rem' }}>or</span>
                    <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }}></div>
                </div>

                <button onClick={handleGoogleLogin} className="btn btn-google" style={{ width: '100%' }}>
                    <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google Logo" />
                    Continue with Google
                </button>
                
                <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                    <p>Don't have an account? <Link to="/register" style={{ color: '#007bff', textDecoration: 'none' }}>Register</Link></p>
                </div>
            </div>
        </div>
    );
};

export default Login;

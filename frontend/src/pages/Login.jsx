import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import PublicNavbar from '../components/PublicNavbar';

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

    const handleGithubLogin = () => {
        window.location.href = 'http://localhost:8080/oauth2/authorization/github';
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
        <>
            <PublicNavbar />
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

                <button onClick={handleGithubLogin} className="btn btn-github" style={{ width: '100%', marginTop: '0.75rem', backgroundColor: '#24292e', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                    <svg height="20" width="20" viewBox="0 0 16 16" version="1.1" style={{ fill: 'white' }}>
                        <path fillRule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
                    </svg>
                    Continue with GitHub
                </button>
                
                <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                    <p>Don't have an account? <Link to="/register" style={{ color: '#007bff', textDecoration: 'none' }}>Register</Link></p>
                </div>
                </div>
            </div>
        </>
    );
};

export default Login;

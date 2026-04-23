import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const { user, loading } = useAuth();
    const navigate = useNavigate();

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
                
                <button onClick={handleGoogleLogin} className="btn btn-google" style={{ width: '100%' }}>
                    <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google Logo" />
                    Continue with Google
                </button>
            </div>
        </div>
    );
};

export default Login;

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
    const [fieldErrors, setFieldErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const validateField = (name, value) => {
        switch (name) {
            case 'name':
                if (/[^a-zA-Z\s]/.test(value)) return 'Name must contain only letters and spaces.';
                if (value.trim().length < 2) return 'Name must be at least 2 characters.';
                return '';
            case 'email':
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) return 'Please enter a valid email address.';
                return '';
            case 'mobile':
                if (/\D/.test(value)) return 'Mobile number must contain digits only.';
                if (value.length !== 10) return 'Mobile number must be exactly 10 digits.';
                return '';
            case 'nic':
                if (!/^(\d{9}V|\d{12})$/.test(value))
                    return 'NIC must be 9 digits followed by uppercase V, or a 12-digit number.';
                return '';
            default:
                return '';
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        // Block invalid characters at input level
        if (name === 'name' && /[^a-zA-Z\s]/.test(value)) return;
        if (name === 'mobile' && /\D/.test(value)) return;
        if (name === 'mobile' && value.length > 10) return;
        if (name === 'nic') {
            if (/[^0-9V]/.test(value)) return;
            const vIdx = value.indexOf('V');
            if (vIdx !== -1 && vIdx !== value.length - 1) return;
            if (value.includes('V') && value.length > 10) return;
            if (!value.includes('V') && value.length > 12) return;
        }

        setFormData({ ...formData, [name]: value });

        // Clear field error once user starts correcting
        if (fieldErrors[name]) {
            setFieldErrors({ ...fieldErrors, [name]: validateField(name, value) });
        }
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        const err = validateField(name, value);
        if (err) setFieldErrors(prev => ({ ...prev, [name]: err }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const errors = {};
        ['name', 'email', 'mobile', 'nic'].forEach(field => {
            const err = validateField(field, formData[field]);
            if (err) errors[field] = err;
        });

        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            return;
        }

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
                            onBlur={handleBlur}
                            required
                            className="auth-input"
                        />
                        {fieldErrors.name && <p style={{ color: '#ff4d4f', fontSize: '0.8rem', marginTop: '0.25rem' }}>{fieldErrors.name}</p>}
                    </div>
                    <div>
                        <input
                            type="email"
                            name="email"
                            placeholder="Email Address"
                            value={formData.email}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            required
                            className="auth-input"
                        />
                        {fieldErrors.email && <p style={{ color: '#ff4d4f', fontSize: '0.8rem', marginTop: '0.25rem' }}>{fieldErrors.email}</p>}
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
                            onBlur={handleBlur}
                            maxLength={10}
                            required
                            className="auth-input"
                        />
                        {fieldErrors.mobile && <p style={{ color: '#ff4d4f', fontSize: '0.8rem', marginTop: '0.25rem' }}>{fieldErrors.mobile}</p>}
                    </div>
                    <div>
                        <input
                            type="text"
                            name="nic"
                            placeholder="NIC Number (e.g. 123456789V or 200012345678)"
                            style={{ textTransform: 'uppercase' }}
                            value={formData.nic}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            required
                            className="auth-input"
                        />
                        {fieldErrors.nic && <p style={{ color: '#ff4d4f', fontSize: '0.8rem', marginTop: '0.25rem' }}>{fieldErrors.nic}</p>}
                    </div>
                    
                    <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', marginTop: '0.5rem' }}>
                        {loading ? 'Registering...' : 'Register'}
                    </button>
                </form>

                <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                    <p style={{ color: '#000000', textDecoration: 'none' }}>Already have an account? <Link to="/login" style={{ color: '#007bff', textDecoration: 'none' }}>Log In</Link></p>
                </div>
                </div>
            </div>
        </>
    );
};

export default Register;

import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { User } from 'lucide-react';
import './UserDashboard.css';

const Profile = () => {
    const { user, checkAuth } = useAuth();
    const [profileData, setProfileData] = useState({
        name: '',
        email: '',
        mobile: '',
        nic: ''
    });
    const [updateMessage, setUpdateMessage] = useState({ text: '', type: '' });
    const [fieldErrors, setFieldErrors] = useState({});
    const [updating, setUpdating] = useState(false);

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
                if (value && /\D/.test(value)) return 'Mobile number must contain digits only.';
                if (value && value.length !== 10) return 'Mobile number must be exactly 10 digits.';
                return '';
            case 'nic':
                if (value && !/^(\d{9}V|\d{12})$/.test(value))
                    return 'NIC must be 9 digits followed by uppercase V, or a 12-digit number.';
                return '';
            default:
                return '';
        }
    };

    useEffect(() => {
        if (user) {
            setProfileData({
                name: user.name || '',
                email: user.email || '',
                mobile: user.mobile || '',
                nic: user.nic || ''
            });
        }
    }, [user]);

    const handleProfileChange = (e) => {
        const { name, value } = e.target;

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

        setProfileData({ ...profileData, [name]: value });

        if (fieldErrors[name]) {
            setFieldErrors({ ...fieldErrors, [name]: validateField(name, value) });
        }
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        const err = validateField(name, value);
        if (err) setFieldErrors(prev => ({ ...prev, [name]: err }));
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setUpdateMessage({ text: '', type: '' });

        const errors = {};
        ['name', 'mobile', 'nic'].forEach(field => {
            const err = validateField(field, profileData[field]);
            if (err) errors[field] = err;
        });

        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            return;
        }

        setUpdating(true);
        try {
            // Only send name, mobile, and nic. Email is not meant to be updated here.
            const updatePayload = {
                name: profileData.name,
                mobile: profileData.mobile,
                nic: profileData.nic
            };
            
            const response = await api.put('/users/profile', updatePayload);
            setUpdateMessage({ text: response.data.message || 'Profile updated successfully!', type: 'success' });
            await checkAuth();
        } catch (error) {
            console.error("Profile update error:", error);
            const errorMessage = error.response?.data?.message || 'Failed to update profile. Please try again.';
            setUpdateMessage({ 
                text: errorMessage, 
                type: 'error' 
            });
        } finally {
            setUpdating(false);
        }
    };

    return (
        <div className="dashboard-layout-container">
            <div className="dashboard-content-col">
                
                <div className="profile-banner-card">
                    <div className="banner-content">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                            <div className="brand-logo" style={{ width: '48px', height: '48px', fontSize: '1.2rem' }}>
                                <User size={24} />
                            </div>
                            <h2 style={{ margin: 0 }}>Personal Profile</h2>
                        </div>
                        <p>Manage your personal information and contact details here. Keep your profile up to date to receive important notifications.</p>
                    </div>
                </div>

                <div>
                    <h3 className="section-title">Edit Personal Details</h3>
                    <div className="form-card">
                        {updateMessage.text && (
                            <div style={{ 
                                padding: '0.75rem', 
                                marginBottom: '1.5rem', 
                                borderRadius: '0.5rem',
                                backgroundColor: updateMessage.type === 'success' ? '#dcfce7' : '#fee2e2',
                                color: updateMessage.type === 'success' ? '#166534' : '#991b1b'
                            }}>
                                {updateMessage.text}
                            </div>
                        )}
                        <form onSubmit={handleProfileUpdate} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '500' }}>Full Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={profileData.name}
                                    onChange={handleProfileChange}
                                    onBlur={handleBlur}
                                    className="form-input-clean"
                                    required
                                />
                                {fieldErrors.name && <span style={{ fontSize: '0.75rem', color: '#991b1b' }}>{fieldErrors.name}</span>}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '500' }}>Email Address</label>
                                <input 
                                    type="email" 
                                    name="email" 
                                    value={profileData.email} 
                                    className="form-input-clean" 
                                    disabled 
                                />
                                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Email cannot be changed</span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '500' }}>Mobile Number</label>
                                <input
                                    type="text"
                                    name="mobile"
                                    value={profileData.mobile}
                                    onChange={handleProfileChange}
                                    onBlur={handleBlur}
                                    maxLength={10}
                                    className="form-input-clean"
                                    placeholder="10-digit number"
                                />
                                {fieldErrors.mobile && <span style={{ fontSize: '0.75rem', color: '#991b1b' }}>{fieldErrors.mobile}</span>}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '500' }}>NIC Number</label>
                                <input
                                    type="text"
                                    name="nic"
                                    value={profileData.nic}
                                    onChange={handleProfileChange}
                                    onBlur={handleBlur}
                                    className="form-input-clean"
                                    placeholder="e.g. 123456789V or 200012345678"
                                    style={{ textTransform: 'uppercase' }}
                                />
                                {fieldErrors.nic && <span style={{ fontSize: '0.75rem', color: '#991b1b' }}>{fieldErrors.nic}</span>}
                            </div>
                            
                            <div style={{ gridColumn: '1 / -1', marginTop: '0.5rem' }}>
                                <button type="submit" className="card-btn" style={{ padding: '0.75rem 2rem' }} disabled={updating}>
                                    {updating ? 'Saving Changes...' : 'Save Profile Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <div className="dashboard-sidebar-col">
                <div className="widget-card">
                    <h3 className="section-title" style={{ fontSize: '1.1rem' }}>Profile Completion</h3>
                    <div style={{ marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                            <span>Completion Rate</span>
                            <span>{Math.round(((profileData.name?1:0) + (profileData.mobile?1:0) + (profileData.nic?1:0) + 1) / 4 * 100)}%</span>
                        </div>
                        <div style={{ width: '100%', height: '8px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ 
                                width: `${((profileData.name?1:0) + (profileData.mobile?1:0) + (profileData.nic?1:0) + 1) / 4 * 100}%`, 
                                height: '100%', 
                                backgroundColor: '#10b981',
                                transition: 'width 0.5s ease'
                            }}></div>
                        </div>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
                        Complete your profile to ensure all university services are available to you.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Profile;

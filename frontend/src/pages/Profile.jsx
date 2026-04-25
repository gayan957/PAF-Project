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
    const [updating, setUpdating] = useState(false);

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
        setProfileData({ ...profileData, [e.target.name]: e.target.value });
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setUpdating(true);
        setUpdateMessage({ text: '', type: '' });
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
                                    className="form-input-clean" 
                                    required
                                />
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
                                    className="form-input-clean" 
                                    placeholder="e.g. +94 77 123 4567"
                                />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '500' }}>NIC Number</label>
                                <input 
                                    type="text" 
                                    name="nic" 
                                    value={profileData.nic} 
                                    onChange={handleProfileChange} 
                                    className="form-input-clean" 
                                    placeholder="e.g. 199912345678"
                                />
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

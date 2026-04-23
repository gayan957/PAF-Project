import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Calendar, Ticket, BookOpen, User as UserIcon } from 'lucide-react';

const UserDashboard = () => {
    const { user, checkAuth } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

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

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await api.get('/dashboard/user');
                setData(response.data);
            } catch (error) {
                console.error("Error fetching dashboard data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleProfileChange = (e) => {
        setProfileData({ ...profileData, [e.target.name]: e.target.value });
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setUpdating(true);
        setUpdateMessage({ text: '', type: '' });
        try {
            await api.put('/users/profile', profileData);
            setUpdateMessage({ text: 'Profile updated successfully!', type: 'success' });
            await checkAuth(); // refresh user data in context
        } catch (error) {
            setUpdateMessage({ 
                text: error.response?.data?.message || 'Failed to update profile', 
                type: 'error' 
            });
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return <div className="loader"></div>;

    return (
        <div className="page-container">
            <div className="container">
                <div className="dashboard-header">
                    <h1 className="dashboard-title">User Dashboard</h1>
                </div>

                <div className="dashboard-grid">
                    <div className="glass-panel stat-card">
                        <div className="stat-icon">
                            <Ticket size={24} />
                        </div>
                        <div className="stat-content">
                            <h3>Active Tickets</h3>
                            <p>3</p>
                        </div>
                    </div>
                    <div className="glass-panel stat-card">
                        <div className="stat-icon" style={{ color: 'var(--success)', background: 'rgba(16, 185, 129, 0.1)' }}>
                            <Calendar size={24} />
                        </div>
                        <div className="stat-content">
                            <h3>Upcoming Bookings</h3>
                            <p>1</p>
                        </div>
                    </div>
                    <div className="glass-panel stat-card">
                        <div className="stat-icon" style={{ color: 'var(--accent)', background: 'rgba(139, 92, 246, 0.1)' }}>
                            <BookOpen size={24} />
                        </div>
                        <div className="stat-content">
                            <h3>Courses</h3>
                            <p>5</p>
                        </div>
                    </div>
                </div>

                <div className="glass-panel content-card" style={{ marginTop: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                        <UserIcon size={24} />
                        <h2>My Profile</h2>
                    </div>
                    
                    {updateMessage.text && (
                        <div style={{ 
                            padding: '0.75rem', 
                            marginBottom: '1rem', 
                            borderRadius: '4px',
                            backgroundColor: updateMessage.type === 'success' ? '#dcfce7' : '#fee2e2',
                            color: updateMessage.type === 'success' ? '#166534' : '#991b1b'
                        }}>
                            {updateMessage.text}
                        </div>
                    )}

                    <form onSubmit={handleProfileUpdate} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label>Name</label>
                            <input 
                                type="text" 
                                name="name" 
                                value={profileData.name} 
                                onChange={handleProfileChange} 
                                style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                            />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label>Email</label>
                            <input 
                                type="email" 
                                name="email" 
                                value={profileData.email} 
                                onChange={handleProfileChange} 
                                style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                            />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label>Mobile Number</label>
                            <input 
                                type="text" 
                                name="mobile" 
                                value={profileData.mobile} 
                                onChange={handleProfileChange} 
                                style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                            />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label>NIC</label>
                            <input 
                                type="text" 
                                name="nic" 
                                value={profileData.nic} 
                                onChange={handleProfileChange} 
                                style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                            />
                        </div>
                        
                        <div style={{ gridColumn: '1 / -1', marginTop: '1rem' }}>
                            <button type="submit" className="btn btn-primary" disabled={updating}>
                                {updating ? 'Updating...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>

                <div className="glass-panel content-card" style={{ marginTop: '2rem' }}>
                    <h2>Server Message</h2>
                    <div className="message-box">
                        {data || "No data received from server."}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;

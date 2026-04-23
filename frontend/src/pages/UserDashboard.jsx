import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Plus } from 'lucide-react';
import CalendarWidget from '../components/CalendarWidget';
import TicketList from '../components/tickets/TicketList';
import TicketForm from '../components/tickets/TicketForm';
import './UserDashboard.css';

const UserDashboard = () => {
    const { user, checkAuth } = useAuth();
    const [tickets, setTickets] = useState([]);
    const [stats, setStats] = useState({ active: 0, bookings: 0, courses: 0 });
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    const [profileData, setProfileData] = useState({
        name: '',
        email: '',
        mobile: '',
        nic: ''
    });
    const [updateMessage, setUpdateMessage] = useState({ text: '', type: '' });
    const [updating, setUpdating] = useState(false);

    const fetchTickets = async () => {
        try {
            const response = await api.get('/tickets');
            if (response.data && Array.isArray(response.data)) {
                setTickets(response.data);
                setStats(prev => ({ 
                    ...prev, 
                    active: response.data.filter(t => t.status !== 'RESOLVED').length 
                }));
            } else {
                setTickets([]);
            }
        } catch (error) {
            console.error("Error fetching tickets:", error.response?.data || error.message);
        } finally {
            setLoading(false);
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

    useEffect(() => {
        fetchTickets();
        // Mocking other stats for now
        setStats(prev => ({ ...prev, bookings: 1, courses: 5 }));
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
            await checkAuth();
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
        <div className="dashboard-layout-container">
            {/* Left Main Content */}
            <div className="dashboard-content-col">
                
                {/* Profile Banner */}
                <div className="profile-banner-card">
                    <div className="banner-content">
                        <h2>Your Profile</h2>
                        <p>Hi <strong>{user?.name}</strong>! Welcome to your student portal. Keep track of your courses, active tickets, and schedule.</p>
                        <button className="banner-btn" onClick={() => setShowForm(true)}>Raise a Ticket</button>
                    </div>
                    {/* Optional: we could add a cool illustration here if available */}
                </div>

                {/* Dashboard Sections */}
                <div>
                    <h3 className="section-title">Active Overview</h3>
                    <div className="cards-row">
                        {/* Course Card */}
                        <div className="colored-card card-yellow">
                            <span className="card-tag">MAT 101</span>
                            <h3 style={{ color: '#f59e0b' }}>Mathematics</h3>
                            <p className="card-subtitle">Enrolled Courses: {stats.courses}</p>
                            <div className="card-footer">
                                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Updated recently</span>
                                <button className="card-btn" style={{ background: '#f59e0b' }}>View</button>
                            </div>
                        </div>
                        
                        {/* Ticket Card */}
                        <div className="colored-card card-purple">
                            <span className="card-tag">SUPPORT</span>
                            <h3 style={{ color: '#8b5cf6' }}>Active Tickets</h3>
                            <p className="card-subtitle">Pending Requests: {stats.active}</p>
                            <div className="card-footer">
                                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Check status</span>
                                <button className="card-btn" style={{ background: '#8b5cf6' }}>Manage</button>
                            </div>
                        </div>

                        {/* Booking Card */}
                        <div className="colored-card card-pink">
                            <span className="card-tag">BOOKING</span>
                            <h3 style={{ color: '#ec4899' }}>Facilities</h3>
                            <p className="card-subtitle">Upcoming Bookings: {stats.bookings}</p>
                            <div className="card-footer">
                                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Lab 304</span>
                                <button className="card-btn" style={{ background: '#ec4899' }}>Details</button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Edit Profile Form */}
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
                                <input type="text" name="name" value={profileData.name} onChange={handleProfileChange} className="form-input-clean" />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '500' }}>Email Address</label>
                                <input type="email" name="email" value={profileData.email} onChange={handleProfileChange} className="form-input-clean" disabled />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '500' }}>Mobile Number</label>
                                <input type="text" name="mobile" value={profileData.mobile} onChange={handleProfileChange} className="form-input-clean" />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '500' }}>NIC Number</label>
                                <input type="text" name="nic" value={profileData.nic} onChange={handleProfileChange} className="form-input-clean" />
                            </div>
                            
                            <div style={{ gridColumn: '1 / -1', marginTop: '0.5rem' }}>
                                <button type="submit" className="card-btn" style={{ padding: '0.75rem 2rem' }} disabled={updating}>
                                    {updating ? 'Saving...' : 'Update Profile'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Tickets List */}
                <div>
                    <h3 className="section-title">Recent Tickets</h3>
                    <div className="form-card">
                        <TicketList tickets={tickets.slice(0, 3)} /> {/* Show only recent 3 */}
                    </div>
                </div>

            </div>

            {/* Right Sidebar (Calendar + Alerts) */}
            <div className="dashboard-sidebar-col">
                <CalendarWidget />
                
                <div className="widget-card">
                    <h3 className="section-title" style={{ fontSize: '1.1rem' }}>Alerts & Tasks</h3>
                    <div className="alert-item">
                        <p><strong>System Update:</strong> The student portal will be undergoing maintenance this Saturday at 2:00 AM.</p>
                    </div>
                    {stats.active > 0 && (
                        <div className="alert-item" style={{ backgroundColor: '#fff7ed', borderColor: '#f97316' }}>
                            <p style={{ color: '#c2410c' }}><strong>Action Required:</strong> You have {stats.active} active support tickets that may need your attention.</p>
                        </div>
                    )}
                </div>
            </div>

            {showForm && (
                <TicketForm 
                    onSuccess={fetchTickets} 
                    onClose={() => setShowForm(false)} 
                />
            )}
        </div>
    );
};

export default UserDashboard;

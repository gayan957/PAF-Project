import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Calendar, Ticket as TicketIcon, BookOpen, User as UserIcon, Plus } from 'lucide-react';
import TicketList from '../components/tickets/TicketList';
import TicketForm from '../components/tickets/TicketForm';

const UserDashboard = () => {
    const { user, checkAuth } = useAuth();
    const [data, setData] = useState(null);
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
        }
    };

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
        fetchData();
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
                    <div>
                        <h1 className="dashboard-title">User Dashboard</h1>
                        <p className="text-muted">Welcome back! Here's an overview of your activity.</p>
                    </div>
                    <button onClick={() => setShowForm(true)} className="btn btn-primary">
                        <Plus size={18} style={{ marginRight: '8px' }} />
                        New Ticket
                    </button>
                </div>

                <div className="dashboard-grid">
                    <div className="glass-panel stat-card">
                        <div className="stat-icon">
                            <TicketIcon size={24} />
                        </div>
                        <div className="stat-content">
                            <h3>Active Tickets</h3>
                            <p>{stats.active}</p>
                        </div>
                    </div>
                    <div className="glass-panel stat-card">
                        <div className="stat-icon" style={{ color: 'var(--success)', background: 'rgba(16, 185, 129, 0.1)' }}>
                            <Calendar size={24} />
                        </div>
                        <div className="stat-content">
                            <h3>Upcoming Bookings</h3>
                            <p>{stats.bookings}</p>
                        </div>
                    </div>
                    <div className="glass-panel stat-card">
                        <div className="stat-icon" style={{ color: 'var(--accent)', background: 'rgba(139, 92, 246, 0.1)' }}>
                            <BookOpen size={24} />
                        </div>
                        <div className="stat-content">
                            <h3>Courses</h3>
                            <p>{stats.courses}</p>
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
                    <TicketList tickets={tickets} />
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

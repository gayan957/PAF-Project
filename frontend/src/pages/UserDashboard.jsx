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
    const [activeCount, setActiveCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    const fetchTickets = async () => {
        try {
            const response = await api.get('/tickets');
            if (response.data && Array.isArray(response.data)) {
                setTickets(response.data);
                setActiveCount(response.data.filter(t => t.status !== 'RESOLVED').length);
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
        fetchTickets();
    }, []);



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
                    {activeCount > 0 && (
                        <div className="alert-item" style={{ backgroundColor: '#fff7ed', borderColor: '#f97316' }}>
                            <p style={{ color: '#c2410c' }}><strong>Action Required:</strong> You have {activeCount} active support tickets that may need your attention.</p>
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

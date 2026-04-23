import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { Plus, Ticket as TicketIcon, Calendar, BookOpen } from 'lucide-react';
import TicketList from '../components/tickets/TicketList';
import TicketForm from '../components/tickets/TicketForm';

const UserDashboard = () => {
    const [tickets, setTickets] = useState([]);
    const [stats, setStats] = useState({ active: 0, bookings: 0, courses: 0 });
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

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
            console.error("Error fetching tickets", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTickets();
        // Mocking other stats for now
        setStats(prev => ({ ...prev, bookings: 1, courses: 5 }));
    }, []);

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
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h2 style={{ margin: 0, border: 'none' }}>Your Support Tickets</h2>
                        <span className="text-muted" style={{ fontSize: '0.875rem' }}>{tickets.length} total tickets</span>
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

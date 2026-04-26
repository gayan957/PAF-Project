import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { Wrench, AlertCircle, CheckCircle, Play } from 'lucide-react';
import TicketList from '../components/tickets/TicketList';
import ResolveModal from '../components/tickets/ResolveModal';

const TechnicianDashboard = () => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [stats, setStats] = useState({ pending: 0, inProgress: 0, resolved: 0 });

    const fetchTickets = async () => {
        try {
            const response = await api.get('/tickets');
            if (response.data && Array.isArray(response.data)) {
                setTickets(response.data);
                
                const pending = response.data.filter(t => t.status === 'OPEN').length;
                const inProgress = response.data.filter(t => t.status === 'IN_PROGRESS').length;
                const resolved = response.data.filter(t => t.status === 'RESOLVED').length;
                setStats({ pending, inProgress, resolved });
            } else {
                setTickets([]);
                setStats({ pending: 0, inProgress: 0, resolved: 0 });
            }
        } catch (error) {
            console.error("Error fetching technician data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTickets();
    }, []);

    const updateStatus = async (ticketId, status) => {
        try {
            await api.patch(`/tickets/${ticketId}/status`, { status });
            fetchTickets();
        } catch (error) {
            console.error("Error updating status", error);
        }
    };

    if (loading) return <div className="loader"></div>;

    const renderTechnicianActions = (ticket) => {
        if (ticket.status === 'OPEN') {
            return (
                <button onClick={() => updateStatus(ticket.id, 'IN_PROGRESS')} className="btn btn-primary btn-sm">
                    <Play size={14} style={{ marginRight: '4px' }} />
                    Start Work
                </button>
            );
        }
        if (ticket.status === 'IN_PROGRESS') {
            return (
                <button onClick={() => setSelectedTicket(ticket)} className="btn btn-primary btn-sm" style={{ backgroundColor: 'var(--success)' }}>
                    <CheckCircle size={14} style={{ marginRight: '4px' }} />
                    Resolve
                </button>
            );
        }
        return null;
    };

    return (
        <div className="page-container">
            <div className="container">
                <div className="dashboard-header">
                    <h1 className="dashboard-title" style={{ color:'black'}}>Technician Dashboard</h1>
                </div>

                <div className="dashboard-grid">
                    <div className="glass-panel stat-card" style={{ background: 'white' }}>
                        <div className="stat-icon" style={{ color: 'var(--danger)', background: 'rgba(239, 68, 68, 0.1)' }}>
                            <AlertCircle size={24} />
                        </div>
                        <div className="stat-content">
                            <h3>Pending</h3>
                            <p style={{ color: 'black' }}>{stats.pending}</p>
                        </div>
                    </div>
                    <div className="glass-panel stat-card" style={{ background: 'white' }}>
                        <div className="stat-icon" style={{ color: 'var(--primary)', background: 'rgba(59, 130, 246, 0.1)' }}>
                            <Wrench size={24} />
                        </div>
                        <div className="stat-content">
                            <h3>In Progress</h3>
                            <p style={{ color: 'black' }}>{stats.inProgress}</p>
                        </div>
                    </div>
                    <div className="glass-panel stat-card" style={{ background: 'white' }}>
                        <div className="stat-icon" style={{ color: 'var(--success)', background: 'rgba(16, 185, 129, 0.1)' }}>
                            <CheckCircle size={24} />
                        </div>
                        <div className="stat-content">
                            <h3>Resolved</h3>
                            <p style={{ color: 'black' }}>{stats.resolved}</p>
                        </div>
                    </div>
                </div>

                <div className="glass-panel content-card" style={{ marginTop: '2rem',background:'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                    <h2 style={{ border: 'none',color:'black' }}>Assigned Support Tickets</h2>
                    <TicketList 
                        tickets={tickets.filter(t => t.status !== 'RESOLVED')} 
                        renderActions={renderTechnicianActions} 
                    />
                </div>

                {tickets.filter(t => t.status === 'RESOLVED').length > 0 && (
                    <div className="glass-panel content-card" style={{ marginTop: '2rem' ,background:'white'}}>
                        <h2 style={{ border: 'none',color:'black' }}>Recent Resolutions</h2>
                        <TicketList tickets={tickets.filter(t => t.status === 'RESOLVED')} />
                    </div>
                )}
            </div>

            {selectedTicket && (
                <ResolveModal 
                    ticket={selectedTicket} 
                    onSuccess={fetchTickets} 
                    onClose={() => setSelectedTicket(null)} 
                />
            )}
        </div>
    );
};

export default TechnicianDashboard;

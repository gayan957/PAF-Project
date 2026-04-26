import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import TicketTable from '../components/tickets/TicketTable';
import { Plus, Trash2, AlertTriangle, Zap, Activity, Info } from 'lucide-react';
import TicketForm from '../components/tickets/TicketForm';
import { useAuth } from '../context/AuthContext';

const priorityConfig = {
    URGENT: { label: 'Urgent', color: '#ef4444', bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.3)', icon: AlertTriangle },
    HIGH:   { label: 'High',   color: '#f97316', bg: 'rgba(249,115,22,0.15)', border: 'rgba(249,115,22,0.3)', icon: Zap },
    MEDIUM: { label: 'Medium', color: '#3b82f6', bg: 'rgba(59,130,246,0.15)', border: 'rgba(59,130,246,0.3)', icon: Activity },
    LOW:    { label: 'Low',    color: '#10b981', bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.3)', icon: Info },
};

const TicketListPage = () => {
    const { user } = useAuth();
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    const isAdmin = user?.role === 'ROLE_ADMIN' || user?.role === 'ADMIN';
    const isTechnician = user?.role === 'ROLE_TECHNICIAN' || user?.role === 'TECHNICIAN';

    const fetchTickets = async () => {
        try {
            const response = await api.get('/tickets');
            if (Array.isArray(response.data)) {
                setTickets(response.data);
            }
        } catch (error) {
            console.error("Error fetching tickets", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteTicket = async (ticketId) => {
        if (!window.confirm("Delete this ticket?")) return;
        try {
            await api.delete(`/tickets/${ticketId}`);
            fetchTickets();
        } catch (error) {
            console.error("Failed to delete ticket", error);
        }
    };

    const renderUserActions = (ticket) => (
        <button 
            onClick={() => handleDeleteTicket(ticket.id)} 
            title="Delete ticket"
            style={{
                width: '34px',
                height: '32px',
                borderRadius: '8px',
                border: '1px solid #dc262624',
                color: '#dc2626',
                background: '#dc26260d',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <Trash2 size={16} />
        </button>
    );

    useEffect(() => {
        fetchTickets();
    }, []);

    if (loading) return <div className="loader"></div>;

    return (
        <div style={{ padding: '24px', maxWidth: '1340px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '20px', marginBottom: '24px' }}>
                <div>
                    <p style={eyebrow}>Support Services</p>
                    <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '850', color: '#0f172a', letterSpacing: '0' }}>
                        All Tickets
                    </h1>
                    <p style={{ margin: '6px 0 0', color: '#64748b', fontSize: '14px' }}>
                        Manage and track support requests, priority levels, and resolution status.
                    </p>
                </div>

                {!isAdmin && !isTechnician && (
                    <button onClick={() => setShowForm(true)} style={primaryButton}>
                        <Plus size={18} />
                        New Ticket
                    </button>
                )}
            </div>

            {/* Priority Stats Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '14px', marginBottom: '22px' }}>
                {Object.entries(priorityConfig).map(([key, cfg]) => {
                    const count = tickets.filter(t => t.priority === key).length;
                    const Icon = cfg.icon;
                    return (
                        <div key={key} style={{
                            background: '#fff',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            padding: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            minHeight: '76px',
                        }}>
                            <div style={{
                                width: '42px',
                                height: '42px',
                                borderRadius: '8px',
                                background: `${cfg.color}14`,
                                color: cfg.color,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                            }}>
                                <Icon size={22} />
                            </div>
                            <div>
                                <div style={{ fontSize: '22px', fontWeight: '850', color: '#0f172a', lineHeight: 1 }}>{count}</div>
                                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '5px', fontWeight: '700' }}>{cfg.label}</div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <TicketTable tickets={tickets} renderActions={renderUserActions} />

            {showForm && (
                <TicketForm 
                    onSuccess={fetchTickets} 
                    onClose={() => setShowForm(false)} 
                />
            )}
        </div>
    );
};

const eyebrow = {
    margin: '0 0 6px',
    color: '#0f766e',
    fontSize: '12px',
    fontWeight: '850',
    textTransform: 'uppercase',
    letterSpacing: '0',
};

const primaryButton = {
    padding: '10px 16px',
    borderRadius: '8px',
    border: 'none',
    background: '#0f766e',
    color: '#fff',
    fontWeight: '850',
    cursor: 'pointer',
    fontSize: '14px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    boxShadow: '0 8px 18px rgba(15, 118, 110, 0.22)',
};

export default TicketListPage;

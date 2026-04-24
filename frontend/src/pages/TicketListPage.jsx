import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import TicketTable from '../components/tickets/TicketTable';
import { Plus, Trash2 } from 'lucide-react';
import TicketForm from '../components/tickets/TicketForm';

const TicketListPage = () => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

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
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.25)',
                color: '#f87171',
                padding: '0.45rem 0.6rem',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.25)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.5)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.25)'; }}
        >
            <Trash2 size={15} />
        </button>
    );

    useEffect(() => {
        fetchTickets();
    }, []);

    if (loading) return <div className="loader"></div>;

    return (
        <div className="page-container">
            <div className="container">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                            width: 44, height: 44, borderRadius: '12px',
                            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 4px 12px rgba(59,130,246,0.4)'
                        }}>
                            <Plus size={22} color="#fff" />
                        </div>
                        <div>
                            <h1 style={{ fontSize: '1.4rem', fontWeight: '700', color: 'rgb(98, 97, 97)', margin: 0 }}>All Tickets</h1>
                            <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>{tickets.length} support tickets</p>
                        </div>
                    </div>
                    <button onClick={() => setShowForm(true)} className="btn btn-primary" style={{ borderRadius: '0.5rem' }}>
                        <Plus size={18} style={{ marginRight: '8px' }} />
                        New Ticket
                    </button>
                </div>

                <TicketTable tickets={tickets} renderActions={renderUserActions} />
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

export default TicketListPage;

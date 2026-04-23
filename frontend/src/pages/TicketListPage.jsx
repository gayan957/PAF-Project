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
            className="btn btn-outline btn-sm" 
            style={{ color: 'var(--danger)', padding: '0.4rem' }}
        >
            <Trash2 size={14} style={{ marginRight: '4px' }} />
            Delete
        </button>
    );

    useEffect(() => {
        fetchTickets();
    }, []);

    if (loading) return <div className="loader"></div>;

    return (
        <div className="page-container">
            <div className="container">
                <div className="dashboard-header">
                    <div>
                        <h1 className="dashboard-title">All Tickets</h1>
                        <p className="text-muted">Total: {tickets.length} tickets</p>
                    </div>
                    <button onClick={() => setShowForm(true)} className="btn btn-primary">
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

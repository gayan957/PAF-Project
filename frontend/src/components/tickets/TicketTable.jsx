import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, AlertTriangle } from 'lucide-react';

const TicketTable = ({ tickets, renderActions }) => {
    const navigate = useNavigate();

    const getStatusClass = (status) => {
        return `status-badge ${status.toLowerCase()}`;
    };

    if (!tickets || tickets.length === 0) {
        return <div className="text-muted" style={{ textAlign: 'center', padding: '2rem' }}>No tickets found.</div>;
    }

    const isOverdue = (ticket) => {
        if (!ticket.expectedResolutionTime) return false;
        if (ticket.status === 'RESOLVED' || ticket.status === 'CLOSED') return false;
        const expected = new Date(ticket.expectedResolutionTime);
        return new Date() > expected;
    };

    return (
        <div style={{
            background: 'rgba(30, 41, 59, 0.7)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '1rem',
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            transition: 'opacity 0.2s'
        }}>
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: 'rgba(99,102,241,0.1)', borderBottom: '1px solid rgba(99,102,241,0.2)' }}>
                            <th style={{ padding: '1rem 1.25rem', color: '#a5b4fc', fontWeight: '600', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'left' }}>ID</th>
                            <th style={{ padding: '1rem 1.25rem', color: '#a5b4fc', fontWeight: '600', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'left' }}>Category</th>
                            <th style={{ padding: '1rem 1.25rem', color: '#a5b4fc', fontWeight: '600', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'left' }}>Description</th>
                            <th style={{ padding: '1rem 1.25rem', color: '#a5b4fc', fontWeight: '600', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'left' }}>Priority</th>
                            <th style={{ padding: '1rem 1.25rem', color: '#a5b4fc', fontWeight: '600', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'left' }}>Status</th>
                            <th style={{ padding: '1rem 1.25rem', color: '#a5b4fc', fontWeight: '600', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'left' }}>Created</th>
                            <th style={{ padding: '1rem 1.25rem', color: '#a5b4fc', fontWeight: '600', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tickets.map((ticket, index) => (
                            <tr key={ticket.id} 
                                style={{ 
                                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                                    transition: 'background 0.15s',
                                    cursor: 'default'
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            >
                                <td style={{ padding: '1rem 1.25rem', color: '#475569', fontSize: '0.85rem', fontFamily: 'monospace' }}>#{ticket.id}</td>
                                <td style={{ padding: '1rem 1.25rem' }}>
                                    <span className="ticket-category" style={{ fontSize: '0.7rem' }}>{ticket.category}</span>
                                </td>
                                <td style={{ padding: '1rem 1.25rem', color: '#f1f5f9', fontWeight: '500', fontSize: '0.9rem', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        {ticket.description}
                                        {isOverdue(ticket) && (
                                            <span style={{ 
                                                display: 'inline-flex', 
                                                alignItems: 'center', 
                                                gap: '0.25rem', 
                                                background: 'rgba(239, 68, 68, 0.1)', 
                                                color: '#ef4444', 
                                                padding: '0.15rem 0.4rem', 
                                                borderRadius: '0.25rem', 
                                                fontSize: '0.65rem', 
                                                fontWeight: 'bold',
                                                border: '1px solid rgba(239, 68, 68, 0.2)'
                                            }}>
                                                <AlertTriangle size={10} />
                                                OVERDUE
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td style={{ padding: '1rem 1.25rem' }}>
                                    <span style={{ 
                                        color: ticket.priority === 'HIGH' || ticket.priority === 'URGENT' ? 'var(--danger)' : 
                                               ticket.priority === 'MEDIUM' ? '#f59e0b' : 'var(--success)',
                                        fontWeight: '600',
                                        fontSize: '0.8rem'
                                    }}>
                                        {ticket.priority}
                                    </span>
                                </td>
                                <td style={{ padding: '1rem 1.25rem' }}>
                                    <span className={getStatusClass(ticket.status)}>
                                        {ticket.status.replace('_', ' ')}
                                    </span>
                                </td>
                                <td style={{ padding: '1rem 1.25rem', color: '#94a3b8', fontSize: '0.875rem' }}>
                                    {new Date(ticket.createdAt).toLocaleDateString()}
                                </td>
                                <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', alignItems: 'center' }}>
                                        <button 
                                            onClick={() => navigate(`/tickets/${ticket.id}`)}
                                            style={{
                                                background: 'rgba(99,102,241,0.1)',
                                                border: '1px solid rgba(99,102,241,0.25)',
                                                color: '#a5b4fc',
                                                padding: '0.45rem 0.6rem',
                                                borderRadius: '0.5rem',
                                                cursor: 'pointer',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                transition: 'all 0.2s',
                                            }}
                                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.25)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.5)'; }}
                                            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.1)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.25)'; }}
                                            title="View Details"
                                        >
                                            <Eye size={15} />
                                        </button>
                                        {renderActions && renderActions(ticket)}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TicketTable;

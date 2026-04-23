import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye } from 'lucide-react';

const TicketTable = ({ tickets }) => {
    const navigate = useNavigate();

    const getStatusClass = (status) => {
        return `status-badge ${status.toLowerCase()}`;
    };

    if (!tickets || tickets.length === 0) {
        return <div className="text-muted" style={{ textAlign: 'center', padding: '2rem' }}>No tickets found.</div>;
    }

    return (
        <div className="glass-panel" style={{ overflowX: 'auto', padding: '1rem' }}>
            <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                        <th style={{ padding: '1rem' }}>ID</th>
                        <th style={{ padding: '1rem' }}>Category</th>
                        <th style={{ padding: '1rem' }}>Description</th>
                        <th style={{ padding: '1rem' }}>Priority</th>
                        <th style={{ padding: '1rem' }}>Status</th>
                        <th style={{ padding: '1rem' }}>Created</th>
                        <th style={{ padding: '1rem', textAlign: 'right' }}>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {tickets.map(ticket => (
                        <tr key={ticket.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <td style={{ padding: '1rem', fontFamily: 'monospace' }}>#{ticket.id}</td>
                            <td style={{ padding: '1rem' }}>
                                <span className="ticket-category" style={{ fontSize: '0.7rem' }}>{ticket.category}</span>
                            </td>
                            <td style={{ padding: '1rem', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {ticket.description}
                            </td>
                            <td style={{ padding: '1rem' }}>
                                <span style={{ 
                                    color: ticket.priority === 'HIGH' || ticket.priority === 'URGENT' ? 'var(--danger)' : 
                                           ticket.priority === 'MEDIUM' ? '#f59e0b' : 'var(--success)',
                                    fontWeight: '600',
                                    fontSize: '0.8rem'
                                }}>
                                    {ticket.priority}
                                </span>
                            </td>
                            <td style={{ padding: '1rem' }}>
                                <span className={getStatusClass(ticket.status)}>
                                    {ticket.status.replace('_', ' ')}
                                </span>
                            </td>
                            <td style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                {new Date(ticket.createdAt).toLocaleDateString()}
                            </td>
                            <td style={{ padding: '1rem', textAlign: 'right' }}>
                                <button 
                                    onClick={() => navigate(`/tickets/${ticket.id}`)}
                                    className="btn-icon-sm"
                                    title="View Details"
                                >
                                    <Eye size={18} />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default TicketTable;

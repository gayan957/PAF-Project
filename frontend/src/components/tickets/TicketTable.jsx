import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, AlertTriangle } from 'lucide-react';

const TicketTable = ({ tickets, renderActions }) => {
    const navigate = useNavigate();

    const getStatusStyle = (status) => {
        const config = {
            OPEN: { bg: '#fee2e2', color: '#991b1b', border: '#fecaca' },
            IN_PROGRESS: { bg: '#e0f2fe', color: '#075985', border: '#bae6fd' },
            RESOLVED: { bg: '#dcfce7', color: '#166534', border: '#bbf7d0' },
            CLOSED: { bg: '#f1f5f9', color: '#475569', border: '#e2e8f0' },
        };
        const style = config[status] || config.CLOSED;
        return {
            padding: '4px 10px',
            borderRadius: '999px',
            fontSize: '11px',
            fontWeight: '800',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: style.bg,
            color: style.color,
            border: `1px solid ${style.border}`,
            whiteSpace: 'nowrap',
            textTransform: 'uppercase'
        };
    };

    const isOverdue = (ticket) => {
        if (!ticket.expectedResolutionTime) return false;
        if (ticket.status === 'RESOLVED' || ticket.status === 'CLOSED') return false;
        const expected = new Date(ticket.expectedResolutionTime);
        return new Date() > expected;
    };

    return (
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                    <thead>
                        <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                            {['ID', 'Category', 'Description', 'Priority', 'Status', 'Created', 'Actions'].map((heading) => (
                                <th key={heading} style={{
                                    padding: '12px 16px',
                                    textAlign: heading === 'Actions' ? 'right' : 'left',
                                    fontWeight: '850',
                                    color: '#334155',
                                    fontSize: '12px',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0',
                                }}>
                                    {heading}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {tickets.map((ticket) => (
                            <tr key={ticket.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={{ padding: '14px 16px', color: '#64748b', fontSize: '13px', fontFamily: 'monospace' }}>#{ticket.id}</td>
                                <td style={{ padding: '14px 16px' }}>
                                    <span style={{ 
                                        fontSize: '11px', 
                                        fontWeight: '800', 
                                        color: '#0f766e',
                                        background: '#0f766e14',
                                        padding: '4px 8px',
                                        borderRadius: '6px',
                                        textTransform: 'uppercase'
                                    }}>
                                        {ticket.category}
                                    </span>
                                </td>
                                <td style={{ padding: '14px 16px', color: '#0f172a', fontWeight: '800', fontSize: '14px', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        {ticket.description}
                                        {isOverdue(ticket) && (
                                            <span style={{ 
                                                display: 'inline-flex', 
                                                alignItems: 'center', 
                                                gap: '0.25rem', 
                                                background: '#fee2e2', 
                                                color: '#ef4444', 
                                                padding: '2px 8px', 
                                                borderRadius: '999px', 
                                                fontSize: '10px', 
                                                fontWeight: '850',
                                            }}>
                                                <AlertTriangle size={10} />
                                                OVERDUE
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td style={{ padding: '14px 16px' }}>
                                    <span style={{ 
                                        color: ticket.priority === 'HIGH' || ticket.priority === 'URGENT' ? '#dc2626' : 
                                               ticket.priority === 'MEDIUM' ? '#d97706' : '#16a34a',
                                        fontWeight: '800',
                                        fontSize: '11px',
                                        background: ticket.priority === 'HIGH' || ticket.priority === 'URGENT' ? '#fef2f2' : 
                                                   ticket.priority === 'MEDIUM' ? '#fffbeb' : '#f0fdf4',
                                        padding: '4px 10px',
                                        borderRadius: '999px',
                                        border: `1px solid ${ticket.priority === 'HIGH' || ticket.priority === 'URGENT' ? '#fecaca' : 
                                               ticket.priority === 'MEDIUM' ? '#fde68a' : '#bbf7d0'}`,
                                        textTransform: 'uppercase'
                                    }}>
                                        {ticket.priority}
                                    </span>
                                </td>
                                <td style={{ padding: '14px 16px' }}>
                                    <span style={getStatusStyle(ticket.status)}>
                                        {ticket.status.replace('_', ' ')}
                                    </span>
                                </td>
                                <td style={{ padding: '14px 16px', color: '#475569', fontSize: '13px' }}>
                                    {new Date(ticket.createdAt).toLocaleDateString()}
                                </td>
                                <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                                    <div style={{ display: 'flex', gap: '7px', justifyContent: 'flex-end' }}>
                                        <button 
                                            onClick={() => navigate(`/tickets/${ticket.id}`)}
                                            title="View Details"
                                            style={{
                                                width: '34px',
                                                height: '32px',
                                                borderRadius: '8px',
                                                border: '1px solid #47556924',
                                                color: '#475569',
                                                background: '#4755690d',
                                                cursor: 'pointer',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}
                                        >
                                            <Eye size={16} />
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

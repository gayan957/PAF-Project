import React from 'react';
import { Clock, CheckCircle2, AlertCircle, User as UserIcon, MapPin } from 'lucide-react';

const TicketList = ({ tickets, renderActions }) => {
    const getStatusIcon = (status) => {
        switch (status) {
            case 'OPEN': return <AlertCircle size={16} className="status-icon open" />;
            case 'IN_PROGRESS': return <Clock size={16} className="status-icon progress" />;
            case 'RESOLVED': return <CheckCircle2 size={16} className="status-icon resolved" />;
            default: return <Clock size={16} />;
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'HIGH':
            case 'URGENT': return '#ef4444';
            case 'MEDIUM': return '#f59e0b';
            case 'LOW': return '#10b981';
            default: return 'var(--text-muted)';
        }
    };

    if (!tickets || !Array.isArray(tickets) || tickets.length === 0) {
        return (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                <p>No tickets found.</p>
            </div>
        );
    }

    return (
        <div className="ticket-list">
            {tickets.map(ticket => (
                <div key={ticket.id} className="glass-panel ticket-card">
                    <div className="ticket-card-header">
                        <span className="ticket-category">{ticket.category}</span>
                        <span className="ticket-id">#{ticket.id}</span>
                    </div>
                    
                    <h3 className="ticket-description">{ticket.description}</h3>
                    
                    <div className="ticket-meta">
                        <div className="meta-item">
                            <MapPin size={14} />
                            <span>{ticket.location || 'No location'}</span>
                        </div>
                        <div className="meta-item">
                            {getStatusIcon(ticket.status)}
                            <span className={`status-text ${ticket.status.toLowerCase()}`}>{ticket.status.replace('_', ' ')}</span>
                        </div>
                        <div className="meta-item">
                            <div className="priority-dot" style={{ backgroundColor: getPriorityColor(ticket.priority) }}></div>
                            <span>{ticket.priority}</span>
                        </div>
                    </div>

                    <div className="ticket-card-footer">
                        <div className="technician-info">
                            <UserIcon size={14} />
                            <span>{ticket.assignedTechnician ? ticket.assignedTechnician.name : 'Unassigned'}</span>
                        </div>
                        <span className="ticket-date">
                            {new Date(ticket.createdAt).toLocaleDateString()}
                        </span>
                    </div>

                    {ticket.attachments && ticket.attachments.length > 0 && (
                        <div className="ticket-attachments-preview">
                            {ticket.attachments.map(att => (
                                <div key={att.id} className="attachment-badge">
                                    {att.fileName}
                                </div>
                            ))}
                        </div>
                    )}

                    {renderActions && (
                        <div className="ticket-actions" style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                            {renderActions(ticket)}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default TicketList;

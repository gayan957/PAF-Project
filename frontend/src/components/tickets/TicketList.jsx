import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, CheckCircle2, AlertCircle, User as UserIcon, MapPin, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
import CommentSection from './CommentSection';

const TicketList = ({ tickets, renderActions }) => {
    const [expandedTicketId, setExpandedTicketId] = useState(null);
    const navigate = useNavigate();

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
                <div 
                    key={ticket.id} 
                    className="glass-panel ticket-card"
                    onClick={() => navigate(`/tickets/${ticket.id}`)}
                    style={{ cursor: 'pointer' }}
                >
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setExpandedTicketId(expandedTicketId === ticket.id ? null : ticket.id);
                                }}
                                className="btn-icon-sm"
                                style={{ gap: '4px', fontSize: '0.75rem', color: 'var(--text-muted)' }}
                            >
                                <MessageSquare size={14} />
                                <span>Comments</span>
                                {expandedTicketId === ticket.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            </button>
                            <span className="ticket-date">
                                {new Date(ticket.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                    </div>

                    {expandedTicketId === ticket.id && (
                        <div onClick={(e) => e.stopPropagation()}>
                            <CommentSection ticketId={ticket.id} />
                        </div>
                    )}

                    {ticket.attachments && ticket.attachments.length > 0 && (
                        <div className="ticket-attachments-preview">
                            {ticket.attachments.map(att => (
                                <div key={att.id} className="attachment-badge">
                                    {att.fileName.includes('_') ? att.fileName.substring(att.fileName.indexOf('_') + 1) : att.fileName}
                                </div>
                            ))}
                        </div>
                    )}

                    {renderActions && (
                        <div 
                            className="ticket-actions" 
                            style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {renderActions(ticket)}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default TicketList;

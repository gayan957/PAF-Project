import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { ArrowLeft, MapPin, User as UserIcon, Tag, AlertCircle, CheckCircle2, Play } from 'lucide-react';
import CommentSection from '../components/tickets/CommentSection';

const TicketDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [ticket, setTicket] = useState(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [ticketRes, userRes] = await Promise.all([
                    api.get(`/tickets/${id}`),
                    api.get('/auth/me')
                ]);
                setTicket(ticketRes.data);
                setUser(userRes.data);
            } catch (error) {
                console.error("Error fetching ticket details", error);
                alert("Ticket not found");
                navigate('/user-dashboard');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, navigate]);

    const updateStatus = async (status) => {
        try {
            const response = await api.patch(`/tickets/${id}/status`, { status });
            setTicket(response.data);
        } catch (error) {
            console.error("Error updating status", error);
        }
    };

    if (loading) return <div className="loader"></div>;
    if (!ticket) return null;

    const isStaff = user?.role === 'ROLE_ADMIN' || user?.role === 'ROLE_TECHNICIAN';

    return (
        <div className="page-container">
            <div className="container">
                <button onClick={() => navigate(-1)} className="btn-icon" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                    <ArrowLeft size={20} />
                    Back
                </button>

                <div className="dashboard-header" style={{ marginBottom: '2rem' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                            <h1 className="dashboard-title" style={{ margin: 0 }}>Ticket #{ticket.id}</h1>
                            <span className={`status-badge ${ticket.status.toLowerCase()}`}>
                                {ticket.status.replace('_', ' ')}
                            </span>
                        </div>
                        <p className="text-muted">{ticket.category} • Created {new Date(ticket.createdAt).toLocaleString()}</p>
                    </div>

                    {isStaff && ticket.status !== 'RESOLVED' && (
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            {ticket.status === 'OPEN' && (
                                <button onClick={() => updateStatus('IN_PROGRESS')} className="btn btn-primary">
                                    <Play size={18} style={{ marginRight: '8px' }} />
                                    Start Progress
                                </button>
                            )}
                            {ticket.status === 'IN_PROGRESS' && (
                                <button onClick={() => updateStatus('RESOLVED')} className="btn btn-primary" style={{ backgroundColor: 'var(--success)' }}>
                                    <CheckCircle2 size={18} style={{ marginRight: '8px' }} />
                                    Mark Resolved
                                </button>
                            )}
                        </div>
                    )}
                </div>

                <div className="dashboard-grid" style={{ gridTemplateColumns: '2fr 1fr', alignItems: 'start' }}>
                    <div className="glass-panel content-card">
                        <h2 style={{ border: 'none', marginBottom: '1rem' }}>Description</h2>
                        <p style={{ lineHeight: '1.6', fontSize: '1.1rem', whiteSpace: 'pre-wrap' }}>{ticket.description}</p>

                        {ticket.attachments && ticket.attachments.length > 0 && (
                            <div style={{ marginTop: '2rem' }}>
                                <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Attachments</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem' }}>
                                    {ticket.attachments.map(att => (
                                        <a 
                                            key={att.id} 
                                            href={`http://localhost:8080/uploads/${att.fileName}`} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="glass-panel"
                                            style={{ padding: '0.5rem', textAlign: 'center', display: 'block', textDecoration: 'none' }}
                                        >
                                            {att.fileName.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                                                <img 
                                                    src={`http://localhost:8080/uploads/${att.fileName}`} 
                                                    alt={att.fileName} 
                                                    style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '4px' }}
                                                />
                                            ) : (
                                                <div style={{ height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                                                    <Tag size={32} />
                                                </div>
                                            )}
                                            <span style={{ fontSize: '0.7rem', display: 'block', marginTop: '0.5rem', color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {att.fileName.includes('_') ? att.fileName.substring(att.fileName.indexOf('_') + 1) : att.fileName}
                                            </span>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        <CommentSection ticketId={ticket.id} />
                    </div>

                    <div className="glass-panel content-card">
                        <h2 style={{ border: 'none', marginBottom: '1rem', fontSize: '1.2rem' }}>Ticket Info</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                            <div className="meta-item-vertical">
                                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Priority</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <div className="priority-dot" style={{ 
                                        backgroundColor: ticket.priority === 'HIGH' || ticket.priority === 'URGENT' ? 'var(--danger)' : 
                                                       ticket.priority === 'MEDIUM' ? '#f59e0b' : 'var(--success)' 
                                    }}></div>
                                    <span style={{ fontWeight: '600' }}>{ticket.priority}</span>
                                </div>
                            </div>
                            <div className="meta-item-vertical">
                                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Location</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <MapPin size={16} color="var(--primary)" />
                                    <span>{ticket.location || 'N/A'}</span>
                                </div>
                            </div>
                            <div className="meta-item-vertical">
                                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Created By</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <UserIcon size={16} color="var(--accent)" />
                                    <span>{ticket.createdBy?.name || 'Anonymous'}</span>
                                </div>
                            </div>
                            <div className="meta-item-vertical">
                                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Assigned To</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <AlertCircle size={16} color="var(--success)" />
                                    <span>{ticket.assignedTechnician?.name || 'Waiting for assignment'}</span>
                                </div>
                            </div>
                            {ticket.resolutionNotes && (
                                <div className="meta-item-vertical" style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(16, 185, 129, 0.05)', borderRadius: '0.5rem', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                                    <label style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: 'bold' }}>Resolution Notes</label>
                                    <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>{ticket.resolutionNotes}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TicketDetailPage;

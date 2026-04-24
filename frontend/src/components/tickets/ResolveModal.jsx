import React, { useState } from 'react';
import { X, CheckCircle } from 'lucide-react';
import api from '../../api/axios';

const ResolveModal = ({ ticket, onSuccess, onClose }) => {
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.patch(`/tickets/${ticket.id}/resolve`, { notes });
            onSuccess();
            onClose();
        } catch (error) {
            console.error("Error resolving ticket", error);
            alert("Failed to resolve ticket");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ 
                maxWidth: '500px', 
                width: '100%', 
                padding: '0', 
                overflow: 'hidden',
                position: 'relative',
                background: '#ffffff',
                borderRadius: '1rem',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                border: '1px solid #e2e8f0'
            }}>
                {/* Background Decor Circles */}
                <div style={{
                    position: 'absolute',
                    top: '-10%',
                    right: '-10%',
                    width: '180px',
                    height: '180px',
                    background: 'rgba(16, 185, 129, 0.05)',
                    borderRadius: '50%',
                    zIndex: 0
                }}></div>

                <div style={{ position: 'relative', zIndex: 1 }}>
                    {/* Header */}
                    <div style={{ 
                        padding: '1.25rem 1.5rem', 
                        borderBottom: '1px solid #f1f5f9',
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        background: 'rgba(16, 185, 129, 0.02)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <div style={{ 
                                background: 'rgba(16, 185, 129, 0.1)', 
                                color: '#10b981', 
                                padding: '0.5rem', 
                                borderRadius: '0.5rem',
                                marginRight: '0.75rem',
                                display: 'flex'
                            }}>
                                <CheckCircle size={20} />
                            </div>
                            <div>
                                <h2 style={{ margin: 0, fontSize: '1.1rem', color: '#0f172a', fontWeight: '700' }}>Resolve Ticket</h2>
                                <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>Ticket ID: #{ticket.id}</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="btn-icon" style={{ background: '#f8fafc', color: '#94a3b8' }}>
                            <X size={18} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
                        <div className="form-group">
                            <label style={{ color: '#334155', fontWeight: '600', marginBottom: '0.5rem', display: 'block', fontSize: '0.9rem' }}>Resolution Notes</label>
                            <textarea 
                                value={notes} 
                                onChange={(e) => setNotes(e.target.value)} 
                                required 
                                rows="5" 
                                className="form-input" 
                                placeholder="Explain how the issue was resolved..."
                                style={{ background: '#f8fafc', borderColor: '#e2e8f0', color: '#0f172a', resize: 'none' }}
                            ></textarea>
                        </div>

                        <div style={{ marginTop: '2rem', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                            <button type="button" onClick={onClose} className="btn btn-outline" style={{ borderRadius: '0.5rem', padding: '0.6rem 1.25rem', color: '#64748b', borderColor: '#e2e8f0' }}>
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                disabled={loading} 
                                className="btn" 
                                style={{ 
                                    background: 'linear-gradient(to right, #10b981, #059669)', 
                                    color: 'white',
                                    borderRadius: '0.5rem',
                                    padding: '0.6rem 1.5rem',
                                    fontWeight: '600',
                                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)'
                                }}
                            >
                                {loading ? "Resolving..." : "Complete Resolution"}
                                <CheckCircle size={18} style={{ marginLeft: '8px' }} />
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ResolveModal;

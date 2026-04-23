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
            <div className="glass-panel modal-content" style={{ maxWidth: '500px', width: '100%', padding: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ margin: 0 }}>Resolve Ticket #{ticket.id}</h2>
                    <button onClick={onClose} className="btn-icon"><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Resolution Notes</label>
                        <textarea 
                            value={notes} 
                            onChange={(e) => setNotes(e.target.value)} 
                            required 
                            rows="5" 
                            className="form-input" 
                            placeholder="Explain how the issue was resolved..."
                        ></textarea>
                    </div>

                    <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                        <button type="button" onClick={onClose} className="btn btn-outline">Cancel</button>
                        <button type="submit" disabled={loading} className="btn btn-primary" style={{ backgroundColor: 'var(--success)' }}>
                            {loading ? "Resolving..." : "Mark as Resolved"}
                            <CheckCircle size={18} style={{ marginLeft: '8px' }} />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ResolveModal;

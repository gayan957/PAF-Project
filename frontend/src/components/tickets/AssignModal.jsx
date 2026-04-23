import React, { useState } from 'react';
import { X, UserPlus } from 'lucide-react';
import api from '../../api/axios';

const AssignModal = ({ ticket, technicians, onSuccess, onClose }) => {
    const [technicianId, setTechnicianId] = useState(ticket.assignedTechnician?.id || '');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!technicianId) {
            alert("Please select a technician.");
            return;
        }
        setLoading(true);
        try {
            await api.patch(`/tickets/${ticket.id}/assign`, { technicianId: parseInt(technicianId, 10) });
            onSuccess();
            onClose();
        } catch (error) {
            console.error("Error assigning technician:", error.response?.data || error.message);
            alert("Failed to assign technician: " + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="glass-panel modal-content" style={{ maxWidth: '400px', width: '100%', padding: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ margin: 0 }}>Assign Ticket #{ticket.id}</h2>
                    <button onClick={onClose} className="btn-icon"><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Select Technician</label>
                        <select 
                            value={technicianId} 
                            onChange={(e) => setTechnicianId(e.target.value)} 
                            required 
                            className="form-input"
                        >
                            <option value="">Select a technician</option>
                            {technicians.map(tech => (
                                <option key={tech.id} value={tech.id}>{tech.name} ({tech.email})</option>
                            ))}
                        </select>
                    </div>

                    <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                        <button type="button" onClick={onClose} className="btn btn-outline">Cancel</button>
                        <button type="submit" disabled={loading} className="btn btn-primary">
                            {loading ? "Assigning..." : "Assign"}
                            <UserPlus size={18} style={{ marginLeft: '8px' }} />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AssignModal;

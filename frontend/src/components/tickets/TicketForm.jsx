import React, { useState } from 'react';
import { X, Upload, Send } from 'lucide-react';
import api from '../../api/axios';

const TicketForm = ({ onSuccess, onClose }) => {
    const [formData, setFormData] = useState({
        category: '',
        description: '',
        priority: 'MEDIUM',
        location: '',
        contactInfo: ''
    });
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files).slice(0, 3);
        setFiles(selectedFiles);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // 1. Create Ticket
            const ticketResponse = await api.post('/tickets', formData);
            const ticketId = ticketResponse.data.id;

            // 2. Upload Attachments if any
            if (files.length > 0) {
                const fileData = new FormData();
                files.forEach(file => fileData.append('files', file));
                await api.post(`/tickets/${ticketId}/attachments`, fileData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }

            onSuccess();
            onClose();
        } catch (error) {
            console.error("Error creating ticket", error);
            alert("Failed to create ticket");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="glass-panel modal-content" style={{ maxWidth: '600px', width: '100%', padding: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ margin: 0 }}>Create Support Ticket</h2>
                    <button onClick={onClose} className="btn-icon"><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit} className="ticket-form">
                    <div className="form-group">
                        <label>Category</label>
                        <select name="category" value={formData.category} onChange={handleChange} required className="form-input">
                            <option value="">Select Category</option>
                            <option value="TECHNICAL">Technical Issue</option>
                            <option value="ACADEMIC">Academic Support</option>
                            <option value="FACILITY">Facility Maintenance</option>
                            <option value="OTHER">Other</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Priority</label>
                        <select name="priority" value={formData.priority} onChange={handleChange} className="form-input">
                            <option value="LOW">Low</option>
                            <option value="MEDIUM">Medium</option>
                            <option value="HIGH">High</option>
                            <option value="URGENT">Urgent</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Location</label>
                        <input type="text" name="location" value={formData.location} onChange={handleChange} placeholder="Room no, Lab, etc." className="form-input" />
                    </div>

                    <div className="form-group">
                        <label>Description</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} required rows="4" className="form-input" placeholder="Describe your issue..."></textarea>
                    </div>

                    <div className="form-group">
                        <label>Contact Info</label>
                        <input type="text" name="contactInfo" value={formData.contactInfo} onChange={handleChange} placeholder="Phone or alternative email" className="form-input" />
                    </div>

                    <div className="form-group">
                        <label>Attachments (Max 3)</label>
                        <div className="file-upload-container">
                            <input type="file" multiple onChange={handleFileChange} id="file-upload" hidden accept="image/*,.pdf,.doc,.docx" />
                            <label htmlFor="file-upload" className="file-upload-label">
                                <Upload size={18} />
                                <span>{files.length > 0 ? `${files.length} files selected` : "Choose files"}</span>
                            </label>
                        </div>
                    </div>

                    <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                        <button type="button" onClick={onClose} className="btn btn-outline">Cancel</button>
                        <button type="submit" disabled={loading} className="btn btn-primary">
                            {loading ? "Submitting..." : "Submit Ticket"}
                            <Send size={18} style={{ marginLeft: '8px' }} />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TicketForm;

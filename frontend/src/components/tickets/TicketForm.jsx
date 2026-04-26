import React, { useState } from 'react';
import { X, Upload, Send, Ticket as TicketIcon } from 'lucide-react';
import api from '../../api/axios';

const TicketForm = ({ onSuccess, onClose }) => {
    const [formData, setFormData] = useState({
        category: '',
        description: '',
        priority: 'MEDIUM',
        location: '',
        contactNumber: ''
    });
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [contactNumberError, setContactNumberError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        // Validation for contact number - only digits and max 10
        if (name === 'contactNumber') {
            const onlyDigits = value.replace(/\D/g, '');
            if (onlyDigits.length > 10) {
                setContactNumberError('Contact number must be exactly 10 digits');
                return;
            }
            if (onlyDigits.length > 0 && onlyDigits.length < 10) {
                setContactNumberError(`${onlyDigits.length}/10 digits`);
            } else if (onlyDigits.length === 10) {
                setContactNumberError('');
            } else {
                setContactNumberError('');
            }
            setFormData({ ...formData, [name]: onlyDigits });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files).slice(0, 3);
        setFiles(selectedFiles);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate contact number
        if (formData.contactNumber.length !== 10) {
            alert('Please enter a valid 10-digit contact number');
            return;
        }
        
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
            <div className="modal-content" style={{ 
                maxWidth: '650px', 
                width: '100%', 
                padding: '0', 
                overflow: 'hidden',
                position: 'relative',
                background: '#ffffff',
                borderRadius: '1.25rem',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                border: '1px solid #e2e8f0'
            }}>
                {/* Background Decor Circles - Adjusted for Light Theme */}
                <div style={{
                    position: 'absolute',
                    top: '-10%',
                    right: '-10%',
                    width: '200px',
                    height: '200px',
                    background: 'rgba(139, 92, 246, 0.05)',
                    borderRadius: '50%',
                    zIndex: 0
                }}></div>
                <div style={{
                    position: 'absolute',
                    bottom: '-5%',
                    left: '-5%',
                    width: '150px',
                    height: '150px',
                    background: 'rgba(236, 72, 153, 0.03)',
                    borderRadius: '50%',
                    zIndex: 0
                }}></div>

                <div style={{ position: 'relative', zIndex: 1 }}>
                    {/* Header - Light Style */}
                    <div style={{ 
                        padding: '1.5rem 2rem', 
                        borderBottom: '1px solid #f1f5f9',
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        background: 'rgba(139, 92, 246, 0.02)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <div style={{ 
                                background: 'rgba(139, 92, 246, 0.1)', 
                                color: '#8b5cf6', 
                                padding: '0.6rem', 
                                borderRadius: '0.6rem',
                                marginRight: '1rem',
                                display: 'flex'
                            }}>
                                <TicketIcon size={22} />
                            </div>
                            <div>
                                <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a', fontWeight: '700' }}>Create Support Ticket</h2>
                                <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>Fill in the details to get assistance</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="btn-icon" style={{ background: '#f8fafc', color: '#94a3b8' }}>
                            <X size={20} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} style={{ padding: '2rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <div className="form-group">
                                <label style={{ color: '#334155', fontWeight: '600', fontSize: '0.9rem', marginBottom: '0.5rem', display: 'block' }}>Category</label>
                                <select 
                                    name="category" 
                                    value={formData.category} 
                                    onChange={handleChange} 
                                    required 
                                    className="form-input"
                                    style={{ 
                                        background: '#f8fafc', 
                                        borderColor: '#e2e8f0', 
                                        color: '#0f172a',
                                        height: '45px'
                                    }}
                                >
                                    <option value="">Select Category</option>
                                    <option value="TECHNICAL">Technical Issue</option>
                                    <option value="ACADEMIC">Academic Support</option>
                                    <option value="FACILITY">Facility Maintenance</option>
                                    <option value="OTHER">Other</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label style={{ color: '#334155', fontWeight: '600', fontSize: '0.9rem', marginBottom: '0.5rem', display: 'block' }}>Priority</label>
                                <select 
                                    name="priority" 
                                    value={formData.priority} 
                                    onChange={handleChange} 
                                    className="form-input"
                                    style={{ 
                                        background: '#f8fafc', 
                                        borderColor: '#e2e8f0', 
                                        color: '#0f172a',
                                        height: '45px'
                                    }}
                                >
                                    <option value="LOW">Low</option>
                                    <option value="MEDIUM">Medium</option>
                                    <option value="HIGH">High</option>
                                    <option value="URGENT">Urgent</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-group" style={{ marginTop: '1rem' }}>
                            <label style={{ color: '#334155', fontWeight: '600', fontSize: '0.9rem', marginBottom: '0.5rem', display: 'block' }}>Location</label>
                            <input 
                                type="text" 
                                name="location" 
                                value={formData.location} 
                                onChange={handleChange} 
                                placeholder="Room no, Lab, Hall, etc." 
                                className="form-input" 
                                style={{ background: '#f8fafc', borderColor: '#e2e8f0', color: '#0f172a', height: '45px' }}
                            />
                        </div>

                        <div className="form-group">
                            <label style={{ color: '#334155', fontWeight: '600', fontSize: '0.9rem', marginBottom: '0.5rem', display: 'block' }}>Description</label>
                            <textarea 
                                name="description" 
                                value={formData.description} 
                                onChange={handleChange} 
                                required 
                                rows="4" 
                                className="form-input" 
                                placeholder="Clearly describe the issue you're facing..."
                                style={{ background: '#f8fafc', borderColor: '#e2e8f0', color: '#0f172a', resize: 'none' }}
                            ></textarea>
                        </div>

                        <div className="form-group">
                            <label style={{ color: '#334155', fontWeight: '600', fontSize: '0.9rem', marginBottom: '0.5rem', display: 'block' }}>Contact Number</label>
                            <input 
                                type="tel" 
                                name="contactNumber" 
                                value={formData.contactNumber} 
                                onChange={handleChange} 
                                placeholder="Enter 10-digit phone number" 
                                className="form-input" 
                                maxLength="10"
                                style={{ 
                                    background: '#f8fafc', 
                                    borderColor: contactNumberError && formData.contactNumber.length > 0 && formData.contactNumber.length < 10 ? '#ef4444' : '#e2e8f0', 
                                    color: '#0f172a', 
                                    height: '45px'
                                }}
                            />
                            {contactNumberError && formData.contactNumber.length > 0 && formData.contactNumber.length < 10 && (
                                <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                                    {contactNumberError}
                                </p>
                            )}
                            {formData.contactNumber.length === 10 && (
                                <p style={{ color: '#10b981', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                                    ✓ Valid contact number
                                </p>
                            )}
                        </div>

                        <div className="form-group">
                            <label style={{ color: '#334155', fontWeight: '600', fontSize: '0.9rem', marginBottom: '0.5rem', display: 'block' }}>Attachments (Max 3)</label>
                            <div className="file-upload-container">
                                <input type="file" multiple onChange={handleFileChange} id="file-upload" hidden accept="image/*,.pdf,.doc,.docx" />
                                <label htmlFor="file-upload" className="file-upload-label" style={{ 
                                    background: '#f8fafc', 
                                    border: '2px dashed #e2e8f0',
                                    color: '#64748b'
                                }}>
                                    <Upload size={18} />
                                    <span>{files.length > 0 ? `${files.length} files selected` : "Drag & drop or click to upload files"}</span>
                                </label>
                            </div>
                        </div>

                        <div style={{ marginTop: '2.5rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                            <button type="button" onClick={onClose} className="btn btn-outline" style={{ borderRadius: '0.75rem', padding: '0.75rem 2rem', color: '#64748b', borderColor: '#e2e8f0' }}>
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                disabled={loading || formData.contactNumber.length !== 10} 
                                className="btn" 
                                style={{ 
                                    background: loading || formData.contactNumber.length !== 10 ? '#cbd5e1' : 'linear-gradient(to right, #8b5cf6, #fe7096)', 
                                    color: 'white',
                                    borderRadius: '0.75rem',
                                    padding: '0.75rem 2.5rem',
                                    fontWeight: '600',
                                    boxShadow: loading || formData.contactNumber.length !== 10 ? 'none' : '0 10px 15px -3px rgba(139, 92, 246, 0.3)',
                                    cursor: loading || formData.contactNumber.length !== 10 ? 'not-allowed' : 'pointer'
                                }}
                            >
                                {loading ? "Creating..." : "Submit Ticket"}
                                <Send size={18} style={{ marginLeft: '8px' }} />
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default TicketForm;

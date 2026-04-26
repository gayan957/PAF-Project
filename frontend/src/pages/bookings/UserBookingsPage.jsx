import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Calendar, MapPin, Users, Clock, Plus, X, CheckCircle, AlertCircle } from 'lucide-react';
import './Bookings.css';

const STATUS_COLORS = {
    PENDING:   { bg: '#fff7ed', color: '#c2410c', label: 'Pending' },
    APPROVED:  { bg: '#f0fdf4', color: '#15803d', label: 'Approved' },
    REJECTED:  { bg: '#fef2f2', color: '#dc2626', label: 'Rejected' },
    CANCELLED: { bg: '#f8fafc', color: '#64748b', label: 'Cancelled' },
};

const BOOKING_STATUS_OPTIONS = ['', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'];

const UserBookingsPage = () => {
    const [activeTab, setActiveTab]         = useState('browse');
    const [resources, setResources]         = useState([]);
    const [myBookings, setMyBookings]       = useState([]);
    const [loading, setLoading]             = useState(true);
    const [showModal, setShowModal]         = useState(false);
    const [selectedResource, setSelected]   = useState(null);
    const [selectedResourceId, setSelectedResourceId] = useState('');
    const [form, setForm]                   = useState({ startTime: '', endTime: '', purpose: '', attendees: '' });
    const [submitting, setSubmitting]       = useState(false);
    const [typeFilter, setTypeFilter]       = useState('');
    const [locationFilter, setLocationFilter] = useState('');
    const [minCapacity, setMinCapacity]     = useState('');
    const [myStatusFilter, setMyStatusFilter] = useState('');
    const [error, setError]                 = useState('');
    const [success, setSuccess]             = useState('');

    useEffect(() => { loadAll(); }, []);

    const loadAll = async () => {
        setLoading(true);
        try {
            const [resRes, bookRes] = await Promise.all([
                api.get('/v1/resources', { params: { status: 'ACTIVE', size: 100 } }),
                api.get('/v1/bookings/my', { params: { size: 100 } }),
            ]);
            setResources(resRes.data?.data?.content || []);
            setMyBookings(bookRes.data?.data?.content || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const openModal = (resource) => {
        setSelected(resource);
        setSelectedResourceId(resource.id?.toString() || '');
        setForm({ startTime: '', endTime: '', purpose: '', attendees: '' });
        setError('');
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelected(null);
        setSelectedResourceId('');
        setError('');
    };

    const handleResourceSelect = (resourceId) => {
        const resource = resources.find(r => String(r.id) === resourceId);
        setSelected(resource || null);
        setSelectedResourceId(resourceId);
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);
        if (!selectedResource) {
            setError('Please select a resource before submitting your booking.');
            setSubmitting(false);
            return;
        }

        try {
            await api.post('/v1/bookings', {
                resourceId: selectedResource.id,
                startTime:  form.startTime + ':00',
                endTime:    form.endTime   + ':00',
                purpose:    form.purpose,
                attendees:  form.attendees ? parseInt(form.attendees, 10) : null,
            });
            closeModal();
            setSuccess('Resource is available. Your booking has been created successfully.');
            loadAll();
        } catch (err) {
            const message = err.response?.status === 409
                ? 'Resource is not available in the selected time slot. Please choose another time or resource.'
                : err.response?.data?.message || 'Failed to book the resource.';
            setError(message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancel = async (id) => {
        if (!window.confirm('Are you sure you want to cancel this booking?')) return;
        try {
            await api.patch(`/v1/bookings/${id}/cancel`);
            setSuccess('Booking cancelled successfully.');
            loadAll();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to cancel booking.');
        }
    };

    const types = [...new Set(resources.map(r => r.type))];
    const minCapacityValue = parseInt(minCapacity, 10);
    const filteredResources = resources.filter(resource => {
        const matchesType = !typeFilter || resource.type === typeFilter;
        const matchesLocation = !locationFilter ||
            resource.location?.toLowerCase().includes(locationFilter.toLowerCase()) ||
            resource.building?.toLowerCase().includes(locationFilter.toLowerCase());
        const matchesCapacity = !minCapacity || (
            !Number.isNaN(minCapacityValue) && resource.capacity != null && resource.capacity >= minCapacityValue
        );
        return matchesType && matchesLocation && matchesCapacity;
    });
    const filteredMyBookings = myBookings.filter(b => !myStatusFilter || b.status === myStatusFilter);
    const nowLocal = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16);

    if (loading) return <div className="loader"></div>;

    return (
        <div className="bookings-page">
            <div className="bookings-header">
                <h1 className="bookings-title">Resource Bookings</h1>
                <p className="bookings-subtitle">Browse available university facilities and add a booking for your chosen slot.</p>
            </div>

            {success && (
                <div className="booking-alert booking-alert-success">
                    <CheckCircle size={16} /> {success}
                    <button onClick={() => setSuccess('')}><X size={14} /></button>
                </div>
            )}
            {error && !showModal && (
                <div className="booking-alert booking-alert-error">
                    <AlertCircle size={16} /> {error}
                    <button onClick={() => setError('')}><X size={14} /></button>
                </div>
            )}

            <div className="bookings-tabs">
                <button
                    className={`booking-tab ${activeTab === 'browse' ? 'active' : ''}`}
                    onClick={() => setActiveTab('browse')}
                >
                    <Plus size={16} /> Add Booking
                </button>
                <button
                    className={`booking-tab ${activeTab === 'my' ? 'active' : ''}`}
                    onClick={() => setActiveTab('my')}
                >
                    <Calendar size={16} /> My Bookings
                    <span className="tab-badge">{myBookings.length}</span>
                </button>
            </div>

            {/* ── Browse Resources tab ── */}
            {activeTab === 'browse' && (
                <div>
                    <div className="booking-panel">
                        <div className="booking-panel-heading">
                            <div>
                                <h2>Add Booking</h2>
                                <p>Select a resource and submit a booking request directly from this page.</p>
                            </div>
                        </div>

                        <form className="booking-panel-form" onSubmit={handleSubmit}>
                            <label>
                                Resource *
                                <select
                                    value={selectedResourceId}
                                    onChange={e => handleResourceSelect(e.target.value)}
                                    required
                                >
                                    <option value="">Select a resource</option>
                                    {resources.map(resource => (
                                        <option key={resource.id} value={resource.id}>
                                            {resource.name} ({resource.type.replace(/_/g, ' ')})
                                        </option>
                                    ))}
                                </select>
                            </label>

                            {selectedResource && (
                                <div className="selected-resource-summary">
                                    <strong>{selectedResource.name}</strong>
                                    <div>{selectedResource.location}</div>
                                    {selectedResource.capacity != null && (
                                        <div>Capacity: {selectedResource.capacity}</div>
                                    )}
                                </div>
                            )}

                            <label>
                                Start Date &amp; Time *
                                <input
                                    type="datetime-local"
                                    value={form.startTime}
                                    min={nowLocal}
                                    onChange={e => setForm({ ...form, startTime: e.target.value })}
                                    required
                                />
                            </label>

                            <label>
                                End Date &amp; Time *
                                <input
                                    type="datetime-local"
                                    value={form.endTime}
                                    min={form.startTime || nowLocal}
                                    onChange={e => setForm({ ...form, endTime: e.target.value })}
                                    required
                                />
                            </label>

                            <label>
                                Purpose *
                                <textarea
                                    value={form.purpose}
                                    onChange={e => setForm({ ...form, purpose: e.target.value })}
                                    placeholder="Describe the purpose of your booking..."
                                    required
                                    maxLength={500}
                                    rows={3}
                                />
                            </label>

                            <label>
                                Number of Attendees
                                <input
                                    type="number"
                                    value={form.attendees}
                                    onChange={e => setForm({ ...form, attendees: e.target.value })}
                                    min={1}
                                    max={selectedResource?.capacity || undefined}
                                    placeholder={selectedResource?.capacity ? `Max ${selectedResource.capacity}` : 'Optional'}
                                />
                            </label>

                            {error && (
                                <div className="modal-error"><AlertCircle size={14} /> {error}</div>
                            )}

                            <div className="modal-actions">
                                <button type="submit" className="btn-primary-action" disabled={submitting}>
                                    {submitting ? 'Booking…' : 'Book Resource'}
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="booking-filters">
                        <button
                            className={`filter-chip ${typeFilter === '' ? 'active' : ''}`}
                            onClick={() => setTypeFilter('')}
                        >All Types</button>
                        {types.map(t => (
                            <button
                                key={t}
                                className={`filter-chip ${typeFilter === t ? 'active' : ''}`}
                                onClick={() => setTypeFilter(t)}
                            >
                                {t.replace(/_/g, ' ')}
                            </button>
                        ))}
                    </div>

                    <div className="booking-search-row">
                        <input
                            type="search"
                            value={locationFilter}
                            onChange={e => setLocationFilter(e.target.value)}
                            placeholder="Filter by location or building"
                        />
                        <input
                            type="number"
                            min="1"
                            value={minCapacity}
                            onChange={e => setMinCapacity(e.target.value)}
                            placeholder="Min capacity"
                        />
                    </div>

                    {filteredResources.length === 0 ? (
                        <p className="no-data">No active resources found.</p>
                    ) : (
                        <div className="resources-grid">
                            {filteredResources.map(resource => (
                                <div key={resource.id} className="resource-card">
                                    <div className="resource-card-header">
                                        <span className="resource-type-badge">
                                            {resource.type.replace(/_/g, ' ')}
                                        </span>
                                    </div>

                                    <h3 className="resource-name">{resource.name}</h3>

                                    <div className="resource-meta">
                                        <span><MapPin size={14} /> {resource.location}</span>
                                        {resource.building && <span>🏢 {resource.building}</span>}
                                        {resource.capacity != null && (
                                            <span><Users size={14} /> Capacity: {resource.capacity}</span>
                                        )}
                                        {resource.availabilityStart && (
                                            <span>
                                                <Clock size={14} />
                                                {resource.availabilityStart} – {resource.availabilityEnd}
                                            </span>
                                        )}
                                    </div>

                                    {resource.description && (
                                        <p className="resource-desc">{resource.description}</p>
                                    )}

                                    <button className="btn-book" onClick={() => openModal(resource)}>
                                        <Plus size={16} /> Book Now
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ── My Bookings tab ── */}
            {activeTab === 'my' && (
                <div className="my-bookings">
                    <div className="booking-filters" style={{ marginBottom: '1rem' }}>
                        {BOOKING_STATUS_OPTIONS.map(status => (
                            <button
                                key={status}
                                className={`filter-chip ${myStatusFilter === status ? 'active' : ''}`}
                                onClick={() => setMyStatusFilter(status)}
                            >
                                {status || 'All'}
                            </button>
                        ))}
                    </div>

                    {filteredMyBookings.length === 0 ? (
                        <div className="no-data-card">
                            <Calendar size={40} />
                            <p>No bookings yet. Go to "Add Booking" to request your first booking.</p>
                        </div>
                    ) : (
                        <div className="bookings-table-wrap">
                            <table className="bookings-table">
                                <thead>
                                    <tr>
                                        <th>Resource</th>
                                        <th>Location</th>
                                        <th>Start</th>
                                        <th>End</th>
                                        <th>Purpose</th>
                                        <th>Attendees</th>
                                        <th>Status</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {myBookings.map(b => {
                                        const s = STATUS_COLORS[b.status] || {};
                                        return (
                                            <tr key={b.id}>
                                                <td><strong>{b.resourceName}</strong></td>
                                                <td>{b.resourceLocation}</td>
                                                <td>{new Date(b.startTime).toLocaleString()}</td>
                                                <td>{new Date(b.endTime).toLocaleString()}</td>
                                                <td style={{ maxWidth: '180px' }}>{b.purpose}</td>
                                                <td>{b.attendees ?? '—'}</td>
                                                <td>
                                                    <span className="status-badge" style={{ background: s.bg, color: s.color }}>
                                                        {s.label || b.status}
                                                    </span>
                                                    {b.status === 'REJECTED' && b.rejectionReason && (
                                                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 3 }}>
                                                            Reason: {b.rejectionReason}
                                                        </div>
                                                    )}
                                                </td>
                                                <td>
                                                    {(b.status === 'PENDING' || b.status === 'APPROVED') && (
                                                        <button className="btn-cancel" onClick={() => handleCancel(b.id)}>
                                                            Cancel
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* ── Booking Modal ── */}
            {showModal && selectedResource && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="booking-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Book: {selectedResource.name}</h2>
                            <button onClick={closeModal}><X size={20} /></button>
                        </div>

                        <div className="modal-resource-info">
                            <span><MapPin size={14} /> {selectedResource.location}</span>
                            {selectedResource.capacity != null && (
                                <span><Users size={14} /> Max capacity: {selectedResource.capacity}</span>
                            )}
                            {selectedResource.availabilityStart && (
                                <span><Clock size={14} /> Available: {selectedResource.availabilityStart} – {selectedResource.availabilityEnd}</span>
                            )}
                        </div>

                        {error && (
                            <div className="modal-error"><AlertCircle size={14} /> {error}</div>
                        )}

                        <form onSubmit={handleSubmit} className="modal-form">
                            <label>
                                Start Date &amp; Time *
                                <input
                                    type="datetime-local"
                                    value={form.startTime}
                                    min={nowLocal}
                                    onChange={e => setForm({ ...form, startTime: e.target.value })}
                                    required
                                />
                            </label>

                            <label>
                                End Date &amp; Time *
                                <input
                                    type="datetime-local"
                                    value={form.endTime}
                                    min={form.startTime || nowLocal}
                                    onChange={e => setForm({ ...form, endTime: e.target.value })}
                                    required
                                />
                            </label>

                            <label>
                                Purpose *
                                <textarea
                                    value={form.purpose}
                                    onChange={e => setForm({ ...form, purpose: e.target.value })}
                                    placeholder="Describe the purpose of your booking..."
                                    required
                                    maxLength={500}
                                    rows={3}
                                />
                            </label>

                            <label>
                                Number of Attendees
                                <input
                                    type="number"
                                    value={form.attendees}
                                    onChange={e => setForm({ ...form, attendees: e.target.value })}
                                    min={1}
                                    max={selectedResource.capacity || undefined}
                                    placeholder={selectedResource.capacity ? `Max ${selectedResource.capacity}` : 'Optional'}
                                />
                            </label>

                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={closeModal}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary-action" disabled={submitting}>
                                    {submitting ? 'Submitting…' : 'Submit Booking Request'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserBookingsPage;

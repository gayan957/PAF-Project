import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Users, Clock, Plus, X, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../../api/axios';
import { getMyBookings, cancelBooking } from '../../api/bookingApi';
import BookingFormModal from '../../components/bookings/BookingFormModal';
import './Bookings.css';

const STATUS_COLORS = {
    PENDING:   { bg: '#fff7ed', color: '#c2410c', label: 'Pending' },
    APPROVED:  { bg: '#f0fdf4', color: '#15803d', label: 'Approved' },
    REJECTED:  { bg: '#fef2f2', color: '#dc2626', label: 'Rejected' },
    CANCELLED: { bg: '#f8fafc', color: '#64748b', label: 'Cancelled' },
};

const BOOKING_STATUS_OPTIONS = ['', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'];

const fmt = (dt) =>
    dt
        ? new Date(dt).toLocaleString('en-GB', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
          })
        : '—';

const UserBookingsPage = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const [activeTab, setActiveTab]           = useState('browse');
    const [resources, setResources]           = useState([]);
    const [myBookings, setMyBookings]         = useState([]);
    const [loading, setLoading]               = useState(true);
    const [showModal, setShowModal]           = useState(false);
    const [selectedResource, setSelectedResource] = useState(null);
    const [typeFilter, setTypeFilter]         = useState('');
    const [locationFilter, setLocationFilter] = useState('');
    const [minCapacity, setMinCapacity]       = useState('');
    const [myStatusFilter, setMyStatusFilter] = useState('');
    const [error, setError]                   = useState('');
    const [success, setSuccess]               = useState('');

    const loadAll = useCallback(async () => {
        setLoading(true);
        try {
            const [resRes, bookRes] = await Promise.all([
                api.get('/v1/resources', { params: { status: 'ACTIVE', size: 100 } }),
                getMyBookings({ size: 100 }),
            ]);
            setResources(resRes.data?.data?.content || []);
            setMyBookings(bookRes.data?.data?.content || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadAll(); }, [loadAll]);

    // Handle ?resourceId=X deep-link from ResourceDetailPage
    useEffect(() => {
        if (!resources.length) return;
        const params = new URLSearchParams(location.search);
        const resourceId = params.get('resourceId');
        if (!resourceId) return;
        const resource = resources.find(r => r.id === parseInt(resourceId, 10));
        if (resource) {
            setSelectedResource(resource);
            setShowModal(true);
            navigate('/bookings', { replace: true });
        }
    }, [resources, location.search]); // eslint-disable-line react-hooks/exhaustive-deps

    const openModal = (resource) => {
        setSelectedResource(resource);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedResource(null);
    };

    const handleCancel = async (id) => {
        if (!window.confirm('Cancel this booking?')) return;
        try {
            await cancelBooking(id);
            setSuccess('Booking cancelled successfully.');
            loadAll();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to cancel booking.');
        }
    };

    const types = [...new Set(resources.map(r => r.type))];
    const minCapacityValue = parseInt(minCapacity, 10);
    const filteredResources = resources.filter(resource => {
        const matchesType     = !typeFilter || resource.type === typeFilter;
        const matchesLocation = !locationFilter ||
            resource.location?.toLowerCase().includes(locationFilter.toLowerCase()) ||
            resource.building?.toLowerCase().includes(locationFilter.toLowerCase());
        const matchesCapacity = !minCapacity || (
            !Number.isNaN(minCapacityValue) && resource.capacity != null && resource.capacity >= minCapacityValue
        );
        return matchesType && matchesLocation && matchesCapacity;
    });
    const filteredMyBookings = myBookings.filter(b => !myStatusFilter || b.status === myStatusFilter);

    if (loading) return <div className="loader"></div>;

    return (
        <div className="bookings-page">
            <div className="bookings-header">
                <h1 className="bookings-title">Resource Bookings</h1>
                <p className="bookings-subtitle">
                    Browse available university facilities and request a booking for your chosen time slot.
                </p>
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
                    {myBookings.length > 0 && (
                        <span className="tab-badge">{myBookings.length}</span>
                    )}
                </button>
            </div>

            {/* ── Browse Resources tab ── */}
            {activeTab === 'browse' && (
                <div>
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
                        <p className="no-data">No active resources match your filters.</p>
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
                            <p>
                                {myStatusFilter
                                    ? `No ${myStatusFilter.toLowerCase()} bookings found.`
                                    : 'No bookings yet. Go to "Add Booking" to request your first booking.'}
                            </p>
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
                                    {filteredMyBookings.map(b => {
                                        const s = STATUS_COLORS[b.status] || {};
                                        return (
                                            <tr key={b.id}>
                                                <td><strong>{b.resourceName}</strong></td>
                                                <td>{b.resourceLocation}</td>
                                                <td style={{ whiteSpace: 'nowrap' }}>{fmt(b.startTime)}</td>
                                                <td style={{ whiteSpace: 'nowrap' }}>{fmt(b.endTime)}</td>
                                                <td style={{ maxWidth: '180px' }}>{b.purpose}</td>
                                                <td>{b.attendees ?? '—'}</td>
                                                <td>
                                                    <span
                                                        className="status-badge"
                                                        style={{ background: s.bg, color: s.color }}
                                                    >
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
                                                        <button
                                                            className="btn-cancel"
                                                            onClick={() => handleCancel(b.id)}
                                                        >
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
                <BookingFormModal
                    resource={selectedResource}
                    onClose={closeModal}
                    onSuccess={() => {
                        closeModal();
                        setSuccess('Booking request submitted! Pending admin approval.');
                        loadAll();
                    }}
                />
            )}
        </div>
    );
};

export default UserBookingsPage;

import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Users, Clock, Plus, X, CheckCircle, AlertCircle, QrCode, Download, BadgeCheck } from 'lucide-react';
import api from '../../api/axios';
import { getMyBookings, cancelBooking, generateQrCode } from '../../api/bookingApi';
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
    const [qrCodeBookingId, setQrCodeBookingId] = useState(null);
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

    const handleGenerateQr = async (id) => {
        try {
            await generateQrCode(id);
            await loadAll();
            setQrCodeBookingId(id);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to generate QR code.');
        }
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

    // Get the selected booking for QR code display
    const selectedQRBooking = qrCodeBookingId ? myBookings.find(b => b.id === qrCodeBookingId) : null;

    const handleDownloadQR = () => {
        if (!selectedQRBooking?.qrCode) return;
        const link = document.createElement('a');
        link.href = selectedQRBooking.qrCode;
        link.download = `booking_${selectedQRBooking.id}_qr.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
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
                                                    {b.status === 'APPROVED' && b.isCheckedIn && (
                                                        <div style={{
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            gap: '0.25rem',
                                                            fontSize: '0.75rem',
                                                            color: '#15803d',
                                                            background: '#dcfce7',
                                                            borderRadius: '999px',
                                                            padding: '2px 8px',
                                                            marginTop: 4,
                                                        }}>
                                                            <BadgeCheck size={12} /> Checked In
                                                        </div>
                                                    )}
                                                </td>
                                                <td>
                                                    {(b.status === 'PENDING' || b.status === 'APPROVED') && (
                                                        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                                                            {b.status === 'APPROVED' && (
                                                                b.qrCode ? (
                                                                    <button
                                                                        className="btn-qr"
                                                                        onClick={() => setQrCodeBookingId(b.id)}
                                                                        title="View check-in QR code"
                                                                        style={{
                                                                            background: '#dbeafe',
                                                                            color: '#0284c7',
                                                                            border: '1px solid #0284c7',
                                                                            borderRadius: '0.5rem',
                                                                            padding: '0.4rem 0.6rem',
                                                                            cursor: 'pointer',
                                                                            fontSize: '0.85rem',
                                                                            fontWeight: '500',
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            gap: '0.3rem',
                                                                            whiteSpace: 'nowrap',
                                                                        }}
                                                                    >
                                                                        <QrCode size={14} /> QR
                                                                    </button>
                                                                ) : (
                                                                    <button
                                                                        onClick={() => handleGenerateQr(b.id)}
                                                                        title="Get your check-in QR code"
                                                                        style={{
                                                                            background: '#fefce8',
                                                                            color: '#a16207',
                                                                            border: '1px solid #ca8a04',
                                                                            borderRadius: '0.5rem',
                                                                            padding: '0.4rem 0.6rem',
                                                                            cursor: 'pointer',
                                                                            fontSize: '0.85rem',
                                                                            fontWeight: '500',
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            gap: '0.3rem',
                                                                            whiteSpace: 'nowrap',
                                                                        }}
                                                                    >
                                                                        <QrCode size={14} /> Get QR
                                                                    </button>
                                                                )
                                                            )}
                                                            <button
                                                                className="btn-cancel"
                                                                onClick={() => handleCancel(b.id)}
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
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

            {/* ── QR Code Modal ── */}
            {qrCodeBookingId && selectedQRBooking && (
                <div className="modal-overlay" onClick={() => setQrCodeBookingId(null)}>
                    <div
                        className="booking-modal"
                        style={{ maxWidth: '420px' }}
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="modal-header">
                            <h2>Check-in QR Code</h2>
                            <button onClick={() => setQrCodeBookingId(null)}><X size={20} /></button>
                        </div>

                        <div style={{ padding: '1.5rem', textAlign: 'center' }}>
                            <div style={{ marginBottom: '1rem', color: '#64748b', fontSize: '0.9rem' }}>
                                <strong>Booking #{selectedQRBooking.id}</strong>
                                <br />
                                {selectedQRBooking.resourceName}
                                <br />
                                {fmt(selectedQRBooking.startTime)} → {fmt(selectedQRBooking.endTime)}
                            </div>

                            {selectedQRBooking.qrCode && (
                                <div style={{
                                    background: '#f8fafc',
                                    padding: '1rem',
                                    borderRadius: '0.75rem',
                                    marginBottom: '1rem',
                                    display: 'inline-block',
                                }}>
                                    <img
                                        src={selectedQRBooking.qrCode}
                                        alt="Check-in QR Code"
                                        style={{
                                            width: '250px',
                                            height: '250px',
                                            border: '3px solid #0284c7',
                                            borderRadius: '0.5rem',
                                        }}
                                    />
                                </div>
                            )}

                            {selectedQRBooking.isCheckedIn ? (
                                <div style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.4rem',
                                    background: '#dcfce7',
                                    color: '#15803d',
                                    borderRadius: '0.5rem',
                                    padding: '0.5rem 1rem',
                                    fontWeight: 600,
                                    fontSize: '0.9rem',
                                    marginBottom: '1.5rem',
                                }}>
                                    <BadgeCheck size={16} /> Checked in at {fmt(selectedQRBooking.checkedInAt)}
                                </div>
                            ) : (
                                <div style={{ color: '#475569', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                                    Show this QR code at the door to check in for your booking.
                                </div>
                            )}

                            <button
                                onClick={handleDownloadQR}
                                style={{
                                    background: '#0284c7',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '0.5rem',
                                    padding: '0.7rem 1.5rem',
                                    cursor: 'pointer',
                                    fontSize: '0.95rem',
                                    fontWeight: '500',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                }}
                            >
                                <Download size={16} /> Download QR Code
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserBookingsPage;

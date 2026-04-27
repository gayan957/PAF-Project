import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Users, Clock, Plus, X, CheckCircle, AlertCircle, Pencil, FileDown } from 'lucide-react';
import api from '../../api/axios';
import { getMyBookings, cancelBooking, updateBooking } from '../../api/bookingApi';
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
    const [editBooking, setEditBooking]       = useState(null);
    const [editForm, setEditForm]             = useState({ startTime: '', endTime: '', purpose: '', attendees: '' });
    const [editLoading, setEditLoading]       = useState(false);
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

    const toInputDatetime = (isoStr) => {
        if (!isoStr) return '';
        const d = new Date(isoStr);
        const pad = (n) => String(n).padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };

    const openEditModal = (b) => {
        setEditBooking(b);
        setEditForm({
            startTime: toInputDatetime(b.startTime),
            endTime:   toInputDatetime(b.endTime),
            purpose:   b.purpose,
            attendees: b.attendees ?? '',
        });
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setEditLoading(true);
        try {
            await updateBooking(editBooking.id, {
                resourceId: editBooking.resourceId,
                startTime:  editForm.startTime,
                endTime:    editForm.endTime,
                purpose:    editForm.purpose,
                attendees:  editForm.attendees !== '' ? parseInt(editForm.attendees, 10) : null,
            });
            setEditBooking(null);
            setSuccess('Booking updated successfully.');
            loadAll();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update booking.');
        } finally {
            setEditLoading(false);
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

    const generateSlipHtml = (b) => {
        const statusColor = { APPROVED: '#15803d', PENDING: '#c2410c', REJECTED: '#dc2626', CANCELLED: '#64748b' };
        const statusBg    = { APPROVED: '#dcfce7', PENDING: '#fff7ed', REJECTED: '#fef2f2', CANCELLED: '#f8fafc' };
        const generated   = new Date().toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
        return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>Booking Slip #${b.id}</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Segoe UI',Arial,sans-serif;background:#f1f5f9;display:flex;justify-content:center;padding:40px 16px;min-height:100vh}
    .slip{background:#fff;border-radius:16px;width:100%;max-width:480px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,.12)}
    .hdr{background:linear-gradient(135deg,#0284c7,#0ea5e9);color:#fff;padding:28px 24px;text-align:center}
    .hdr h1{font-size:1.4rem;font-weight:700;margin-bottom:4px}
    .hdr p{font-size:.85rem;opacity:.85}
    .ref{background:rgba(255,255,255,.18);border-radius:8px;padding:10px 20px;margin-top:16px;display:inline-block;font-size:1.1rem;font-weight:700;letter-spacing:1px}
    .body{padding:24px}
    .sec{font-size:.7rem;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;font-weight:700;margin:20px 0 10px}
    .sec:first-child{margin-top:0}
    .row{display:flex;justify-content:space-between;align-items:flex-start;padding:9px 0;border-bottom:1px solid #f1f5f9}
    .row:last-child{border-bottom:none}
    .lbl{color:#64748b;font-size:.85rem}
    .val{font-weight:600;font-size:.88rem;color:#1e293b;text-align:right;max-width:60%}
    .pill{display:inline-block;padding:3px 12px;border-radius:999px;font-size:.78rem;font-weight:700;background:${statusBg[b.status]||'#f8fafc'};color:${statusColor[b.status]||'#64748b'}}
    .ftr{background:#f8fafc;border-top:1px dashed #e2e8f0;padding:16px 24px;text-align:center}
    .ftr p{font-size:.78rem;color:#64748b;line-height:1.6}
    .ftr strong{color:#0284c7}
    @media print{body{background:#fff;padding:0}.slip{box-shadow:none;border-radius:0}}
  </style>
</head>
<body>
<div class="slip">
  <div class="hdr">
    <h1>Booking Confirmation Slip</h1>
    <p>University Resource Booking System</p>
    <div class="ref">Booking #${b.id}</div>
  </div>
  <div class="body">
    <div class="sec">Resource Details</div>
    <div class="row"><span class="lbl">Resource</span><span class="val">${b.resourceName}</span></div>
    <div class="row"><span class="lbl">Location</span><span class="val">${b.resourceLocation || '—'}</span></div>
    <div class="sec">Booking Details</div>
    <div class="row"><span class="lbl">From</span><span class="val">${fmt(b.startTime)}</span></div>
    <div class="row"><span class="lbl">To</span><span class="val">${fmt(b.endTime)}</span></div>
    <div class="row"><span class="lbl">Purpose</span><span class="val">${b.purpose}</span></div>
    <div class="row"><span class="lbl">Attendees</span><span class="val">${b.attendees ?? '—'}</span></div>
    <div class="row"><span class="lbl">Status</span><span class="val"><span class="pill">${b.status}</span></span></div>
    <div class="sec">Booked By</div>
    <div class="row"><span class="lbl">Name</span><span class="val">${b.userName}</span></div>
    <div class="row"><span class="lbl">Email</span><span class="val">${b.userEmail}</span></div>
    ${b.reviewedBy ? `<div class="row"><span class="lbl">Approved By</span><span class="val">${b.reviewedBy}</span></div>` : ''}
  </div>
  <div class="ftr">
    <p>Present this slip at the entrance to access the booked resource.<br/>Generated on <strong>${generated}</strong></p>
  </div>
</div>
</body>
</html>`;
    };

    const handleDownloadSlip = (b) => {
        const html = generateSlipHtml(b);
        const blob = new Blob([html], { type: 'text/html' });
        const url  = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `booking_slip_${b.id}.html`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
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
                                                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                                                        {b.status === 'PENDING' && (
                                                            <button
                                                                onClick={() => openEditModal(b)}
                                                                title="Edit booking"
                                                                style={{
                                                                    background: '#eff6ff',
                                                                    color: '#1d4ed8',
                                                                    border: '1px solid #1d4ed8',
                                                                    borderRadius: '0.5rem',
                                                                    padding: '0.4rem',
                                                                    cursor: 'pointer',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                }}
                                                            >
                                                                <Pencil size={15} />
                                                            </button>
                                                        )}
                                                        {b.status === 'APPROVED' && (
                                                            <button
                                                                onClick={() => handleDownloadSlip(b)}
                                                                title="Download booking slip"
                                                                style={{
                                                                    background: '#f0fdf4',
                                                                    color: '#15803d',
                                                                    border: '1px solid #15803d',
                                                                    borderRadius: '0.5rem',
                                                                    padding: '0.35rem 0.6rem',
                                                                    cursor: 'pointer',
                                                                    fontSize: '0.82rem',
                                                                    fontWeight: '500',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '0.25rem',
                                                                }}
                                                            >
                                                                <FileDown size={13} /> Slip
                                                            </button>
                                                        )}
                                                        {(b.status === 'PENDING' || b.status === 'APPROVED') && (
                                                            <button
                                                                className="btn-cancel"
                                                                onClick={() => handleCancel(b.id)}
                                                            >
                                                                Cancel
                                                            </button>
                                                        )}
                                                    </div>
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

            {/* ── Edit Booking Modal ── */}
            {editBooking && (
                <div className="modal-overlay" onClick={() => setEditBooking(null)}>
                    <div
                        className="booking-modal"
                        style={{ maxWidth: '480px' }}
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="modal-header">
                            <h2>Edit Booking — {editBooking.resourceName}</h2>
                            <button onClick={() => setEditBooking(null)}><X size={20} /></button>
                        </div>

                        <form onSubmit={handleEditSubmit} className="modal-form">
                            <label>
                                Start Time *
                                <input
                                    type="datetime-local"
                                    value={editForm.startTime}
                                    onChange={e => setEditForm(f => ({ ...f, startTime: e.target.value }))}
                                    required
                                />
                            </label>
                            <label>
                                End Time *
                                <input
                                    type="datetime-local"
                                    value={editForm.endTime}
                                    onChange={e => setEditForm(f => ({ ...f, endTime: e.target.value }))}
                                    required
                                />
                            </label>
                            <label>
                                Purpose *
                                <textarea
                                    value={editForm.purpose}
                                    onChange={e => setEditForm(f => ({ ...f, purpose: e.target.value }))}
                                    required
                                    rows={3}
                                    maxLength={500}
                                />
                            </label>
                            <label>
                                Attendees
                                <input
                                    type="number"
                                    min="1"
                                    value={editForm.attendees}
                                    onChange={e => setEditForm(f => ({ ...f, attendees: e.target.value }))}
                                    placeholder="Optional"
                                />
                            </label>

                            <div className="modal-actions">
                                <button
                                    type="button"
                                    className="btn-secondary"
                                    onClick={() => setEditBooking(null)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn-book"
                                    disabled={editLoading}
                                >
                                    {editLoading ? 'Saving…' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
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

import React, { useState, useEffect } from 'react';
import { Check, X, CheckCircle, AlertCircle, Calendar } from 'lucide-react';
import {
    getAllBookings,
    approveBooking,
    rejectBooking,
    getBookingStats,
} from '../../api/bookingApi';
import './Bookings.css';

const STATUS_COLORS = {
    PENDING:   { bg: '#fff7ed', color: '#c2410c' },
    APPROVED:  { bg: '#f0fdf4', color: '#15803d' },
    REJECTED:  { bg: '#fef2f2', color: '#dc2626' },
    CANCELLED: { bg: '#f8fafc', color: '#64748b' },
};

const STATUSES = ['', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'];

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

const AdminBookingsPage = () => {
    const [bookings, setBookings]             = useState([]);
    const [stats, setStats]                   = useState(null);
    const [loading, setLoading]               = useState(true);
    const [statusFilter, setStatusFilter]     = useState('');
    const [resourceQuery, setResourceQuery]   = useState('');
    const [userQuery, setUserQuery]           = useState('');
    const [selectedDateFilter, setSelectedDateFilter] = useState('');
    const [rejectId, setRejectId]             = useState(null);
    const [rejectReason, setRejectReason]     = useState('');
    const [actionLoading, setActionLoading]   = useState(false);
    const [message, setMessage]               = useState({ text: '', type: '' });

    useEffect(() => { loadStats(); }, []);

    useEffect(() => {
        loadBookings();
    }, [statusFilter, resourceQuery, userQuery]); // eslint-disable-line react-hooks/exhaustive-deps

    const loadStats = async () => {
        try {
            const res = await getBookingStats();
            setStats(res.data?.data);
        } catch (e) {
            console.error('Failed to load booking stats', e);
        }
    };

    const loadBookings = async () => {
        setLoading(true);
        try {
            const params = { size: 200 };
            if (statusFilter)  params.status       = statusFilter;
            if (resourceQuery) params.resourceName = resourceQuery;
            if (userQuery)     params.userEmail     = userQuery;
            const res = await getAllBookings(params);
            setBookings(res.data?.data?.content || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const notify = (text, type = 'success') => {
        setMessage({ text, type });
        setTimeout(() => setMessage({ text: '', type: '' }), 4000);
    };

    const handleApprove = async (id) => {
        if (!window.confirm('Approve this booking?')) return;
        setActionLoading(true);
        try {
            await approveBooking(id);
            notify('Booking approved successfully.');
            loadBookings();
            loadStats();
        } catch (err) {
            notify(err.response?.data?.message || 'Failed to approve booking.', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const handleRejectSubmit = async (e) => {
        e.preventDefault();
        if (!rejectReason.trim()) return;
        setActionLoading(true);
        try {
            await rejectBooking(rejectId, rejectReason.trim());
            setRejectId(null);
            setRejectReason('');
            notify('Booking rejected.');
            loadBookings();
            loadStats();
        } catch (err) {
            notify(err.response?.data?.message || 'Failed to reject booking.', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const pendingCount = bookings.filter(b => b.status === 'PENDING').length;

    const getFilteredBookings = () => {
        if (!selectedDateFilter) return bookings;
        
        const selectedDate = new Date(selectedDateFilter);
        const startOfDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 0, 0, 0);
        const endOfDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 23, 59, 59);
        
        return bookings.filter(booking => {
            const bookingStart = new Date(booking.startTime);
            const bookingEnd = new Date(booking.endTime);
            // Show bookings that overlap with the selected date
            return bookingStart < endOfDay && bookingEnd > startOfDay;
        });
    };

    const filteredBookings = getFilteredBookings();

    return (
        <div className="bookings-page">
            <div className="bookings-header">
                <h1 className="bookings-title">Booking Management</h1>
                <p className="bookings-subtitle">
                    Review and manage all facility booking requests
                    {pendingCount > 0 && !statusFilter && (
                        <span style={{
                            marginLeft: '0.75rem',
                            background: '#fff7ed',
                            color: '#c2410c',
                            borderRadius: '999px',
                            padding: '2px 10px',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                        }}>
                            {pendingCount} pending
                        </span>
                    )}
                </p>
            </div>

            {/* Stats row */}
            {stats && (
                <div className="booking-stats-row">
                    <div className="booking-stat-card">
                        <div className="stat-value">{stats.total}</div>
                        <div className="stat-label">Total</div>
                    </div>
                    <div className="booking-stat-card pending">
                        <div className="stat-value">{stats.pending}</div>
                        <div className="stat-label">Pending</div>
                    </div>
                    <div className="booking-stat-card approved">
                        <div className="stat-value">{stats.approved}</div>
                        <div className="stat-label">Approved</div>
                    </div>
                    <div className="booking-stat-card rejected">
                        <div className="stat-value">{stats.rejected}</div>
                        <div className="stat-label">Rejected</div>
                    </div>
                    <div className="booking-stat-card cancelled">
                        <div className="stat-value">{stats.cancelled}</div>
                        <div className="stat-label">Cancelled</div>
                    </div>
                    <div className="booking-stat-card upcoming">
                        <div className="stat-value">{stats.upcomingApproved}</div>
                        <div className="stat-label">Upcoming</div>
                    </div>
                    <div className="booking-stat-card today">
                        <div className="stat-value">{stats.todayApproved}</div>
                        <div className="stat-label">Today</div>
                    </div>
                </div>
            )}

            {message.text && (
                <div className={`booking-alert booking-alert-${message.type}`}>
                    {message.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                    {message.text}
                    <button onClick={() => setMessage({ text: '', type: '' })}><X size={14} /></button>
                </div>
            )}

            <div className="booking-filters">
                {STATUSES.map(s => (
                    <button
                        key={s}
                        className={`filter-chip ${statusFilter === s ? 'active' : ''}`}
                        onClick={() => setStatusFilter(s)}
                    >
                        {s || 'All'}
                    </button>
                ))}
            </div>

            <div className="booking-search-row">
                <input
                    type="search"
                    value={resourceQuery}
                    onChange={e => setResourceQuery(e.target.value)}
                    placeholder="Search by resource name"
                />
                <input
                    type="search"
                    value={userQuery}
                    onChange={e => setUserQuery(e.target.value)}
                    placeholder="Search by user email"
                />
                <input
                    type="date"
                    value={selectedDateFilter}
                    onChange={e => setSelectedDateFilter(e.target.value)}
                    title="Filter by date"
                    placeholder="Filter by date"
                />
                {selectedDateFilter && (
                    <button
                        type="button"
                        onClick={() => setSelectedDateFilter('')}
                        style={{
                            background: '#f3f4f6',
                            border: '1px solid #d1d5db',
                            color: '#374151',
                            borderRadius: '0.75rem',
                            padding: '0.8rem 1rem',
                            cursor: 'pointer',
                            fontSize: '0.95rem',
                            fontWeight: '500',
                        }}
                    >
                        Clear Date
                    </button>
                )}
            </div>

            {selectedDateFilter && (
                <div style={{
                    padding: '0.75rem 1rem',
                    background: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    borderRadius: '0.5rem',
                    fontSize: '0.9rem',
                    color: '#15803d',
                    marginBottom: '1rem'
                }}>
                    ✓ Showing {filteredBookings.length} booking(s) for {selectedDateFilter}
                </div>
            )}

            {loading ? (
                <div className="loader"></div>
            ) : filteredBookings.length === 0 ? (
                <div className="no-data-card">
                    <Calendar size={40} />
                    <p>No bookings found{statusFilter ? ` with status "${statusFilter}"` : ''}{selectedDateFilter ? ` on ${selectedDateFilter}` : ''}.</p>
                </div>
            ) : (
                <div className="bookings-table-wrap" style={{ marginTop: '0.5rem' }}>
                    <table className="bookings-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Resource</th>
                                <th>Requested By</th>
                                <th>Start</th>
                                <th>End</th>
                                <th>Purpose</th>
                                <th>Attendees</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredBookings.map(b => {
                                const s = STATUS_COLORS[b.status] || {};
                                return (
                                    <tr key={b.id}>
                                        <td style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{b.id}</td>
                                        <td>
                                            <strong>{b.resourceName}</strong>
                                            <br />
                                            <small style={{ color: '#64748b' }}>{b.resourceLocation}</small>
                                        </td>
                                        <td>
                                            {b.userName}
                                            <br />
                                            <small style={{ color: '#64748b' }}>{b.userEmail}</small>
                                        </td>
                                        <td style={{ whiteSpace: 'nowrap' }}>{fmt(b.startTime)}</td>
                                        <td style={{ whiteSpace: 'nowrap' }}>{fmt(b.endTime)}</td>
                                        <td style={{ maxWidth: '160px' }}>{b.purpose}</td>
                                        <td>{b.attendees ?? '—'}</td>
                                        <td>
                                            <span
                                                className="status-badge"
                                                style={{ background: s.bg, color: s.color }}
                                            >
                                                {b.status}
                                            </span>
                                            {b.status === 'REJECTED' && b.rejectionReason && (
                                                <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: 4 }}>
                                                    {b.rejectionReason}
                                                </div>
                                            )}
                                            {b.status === 'APPROVED' && b.reviewedBy && (
                                                <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: 4 }}>
                                                    by {b.reviewedBy}
                                                </div>
                                            )}
                                        </td>
                                        <td>
                                            {b.status === 'PENDING' && (
                                                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                                                    <button
                                                        className="btn-approve"
                                                        onClick={() => handleApprove(b.id)}
                                                        disabled={actionLoading}
                                                    >
                                                        <Check size={14} /> Approve
                                                    </button>
                                                    <button
                                                        className="btn-reject"
                                                        onClick={() => { setRejectId(b.id); setRejectReason(''); }}
                                                        disabled={actionLoading}
                                                    >
                                                        <X size={14} /> Reject
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

            {/* ── Reject Reason Modal ── */}
            {rejectId && (
                <div className="modal-overlay" onClick={() => setRejectId(null)}>
                    <div
                        className="booking-modal"
                        style={{ maxWidth: '480px' }}
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="modal-header">
                            <h2>Reject Booking #{rejectId}</h2>
                            <button onClick={() => setRejectId(null)}><X size={20} /></button>
                        </div>

                        <form onSubmit={handleRejectSubmit} className="modal-form">
                            <label>
                                Reason for Rejection *
                                <textarea
                                    value={rejectReason}
                                    onChange={e => setRejectReason(e.target.value)}
                                    placeholder="Explain why this booking is being rejected…"
                                    required
                                    rows={4}
                                    autoFocus
                                />
                            </label>

                            <div className="modal-actions">
                                <button
                                    type="button"
                                    className="btn-secondary"
                                    onClick={() => setRejectId(null)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn-reject-submit"
                                    disabled={actionLoading || !rejectReason.trim()}
                                >
                                    {actionLoading ? 'Processing…' : 'Confirm Rejection'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminBookingsPage;

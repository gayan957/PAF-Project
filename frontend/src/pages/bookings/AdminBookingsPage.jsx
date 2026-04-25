import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Check, X, CheckCircle, AlertCircle } from 'lucide-react';
import './Bookings.css';

const STATUS_COLORS = {
    PENDING:   { bg: '#fff7ed', color: '#c2410c' },
    APPROVED:  { bg: '#f0fdf4', color: '#15803d' },
    REJECTED:  { bg: '#fef2f2', color: '#dc2626' },
    CANCELLED: { bg: '#f8fafc', color: '#64748b' },
};

const STATUSES = ['', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'];

const AdminBookingsPage = () => {
    const [bookings, setBookings]         = useState([]);
    const [loading, setLoading]           = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const [rejectId, setRejectId]         = useState(null);
    const [rejectReason, setRejectReason] = useState('');
    const [actionLoading, setActionLoading] = useState(false);
    const [message, setMessage]           = useState({ text: '', type: '' });

    useEffect(() => { loadBookings(); }, [statusFilter]); // eslint-disable-line react-hooks/exhaustive-deps

    const loadBookings = async () => {
        setLoading(true);
        try {
            const params = { size: 200 };
            if (statusFilter) params.status = statusFilter;
            const res = await api.get('/v1/bookings', { params });
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
            await api.patch(`/v1/bookings/${id}/approve`);
            notify('Booking approved successfully.');
            loadBookings();
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
            await api.patch(`/v1/bookings/${rejectId}/reject`, null, {
                params: { reason: rejectReason.trim() },
            });
            setRejectId(null);
            setRejectReason('');
            notify('Booking rejected.');
            loadBookings();
        } catch (err) {
            notify(err.response?.data?.message || 'Failed to reject booking.', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const pendingCount = bookings.filter(b => b.status === 'PENDING').length;

    return (
        <div className="bookings-page">
            <div className="bookings-header">
                <h1 className="bookings-title">Booking Management</h1>
                <p className="bookings-subtitle">
                    Review and manage all facility booking requests
                    {pendingCount > 0 && !statusFilter && (
                        <span style={{ marginLeft: '0.75rem', background: '#fff7ed', color: '#c2410c', borderRadius: '999px', padding: '2px 10px', fontSize: '0.8rem', fontWeight: 700 }}>
                            {pendingCount} pending
                        </span>
                    )}
                </p>
            </div>

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

            {loading ? (
                <div className="loader"></div>
            ) : bookings.length === 0 ? (
                <p className="no-data">No bookings found{statusFilter ? ` with status "${statusFilter}"` : ''}.</p>
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
                            {bookings.map(b => {
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
                                        <td style={{ whiteSpace: 'nowrap' }}>{new Date(b.startTime).toLocaleString()}</td>
                                        <td style={{ whiteSpace: 'nowrap' }}>{new Date(b.endTime).toLocaleString()}</td>
                                        <td style={{ maxWidth: '160px' }}>{b.purpose}</td>
                                        <td>{b.attendees ?? '—'}</td>
                                        <td>
                                            <span className="status-badge" style={{ background: s.bg, color: s.color }}>
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
                    <div className="booking-modal" style={{ maxWidth: '480px' }} onClick={e => e.stopPropagation()}>
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
                                <button type="button" className="btn-secondary" onClick={() => setRejectId(null)}>
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

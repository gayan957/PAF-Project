import React, { useState, useEffect } from 'react';
import {
    AlertCircle,
    Calendar,
    CheckCircle,
    Clock,
    Info,
    MapPin,
    Users,
    X,
} from 'lucide-react';
import { createBooking, getResourceAvailability } from '../../api/bookingApi';

const TYPE_META = {
    LECTURE_HALL: { label: 'Lecture Hall', color: '#7c3aed', bg: '#f3e8ff' },
    LAB:          { label: 'Laboratory',   color: '#0284c7', bg: '#e0f2fe' },
    MEETING_ROOM: { label: 'Meeting Room', color: '#0f766e', bg: '#ccfbf1' },
    EQUIPMENT:    { label: 'Equipment',    color: '#c2410c', bg: '#ffedd5' },
};

const fmtSlot = (dt) =>
    new Date(dt).toLocaleString('en-GB', {
        weekday: 'short', day: '2-digit', month: 'short',
        hour: '2-digit', minute: '2-digit',
    });

/**
 * Reusable booking form modal.
 * Props:
 *   resource  – the resource object to book
 *   onClose   – called when user dismisses the modal
 *   onSuccess – called after a successful submission (modal stays open briefly, then calls this)
 */
export default function BookingFormModal({ resource, onClose, onSuccess }) {
    const [form, setForm] = useState({
        startTime: '',
        endTime: '',
        purpose: '',
        attendees: '',
    });
    const [submitting, setSubmitting]           = useState(false);
    const [submitted, setSubmitted]             = useState(false);
    const [error, setError]                     = useState('');
    const [conflictSlots, setConflictSlots]     = useState([]);
    const [checkingConflicts, setCheckingConflicts] = useState(false);

    const meta     = TYPE_META[resource?.type] || TYPE_META.EQUIPMENT;
    const nowLocal = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
                        .toISOString()
                        .slice(0, 16);

    // Live conflict check whenever time window changes
    useEffect(() => {
        if (!form.startTime || !form.endTime) {
            setConflictSlots([]);
            return;
        }
        const start = new Date(form.startTime);
        const end   = new Date(form.endTime);
        if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) {
            setConflictSlots([]);
            return;
        }

        let cancelled = false;
        setCheckingConflicts(true);
        getResourceAvailability(resource.id, form.startTime + ':00', form.endTime + ':00')
            .then(res => { if (!cancelled) setConflictSlots(res.data?.data || []); })
            .catch(()  => { if (!cancelled) setConflictSlots([]); })
            .finally(()=> { if (!cancelled) setCheckingConflicts(false); });

        return () => { cancelled = true; };
    }, [resource.id, form.startTime, form.endTime]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);
        try {
            await createBooking({
                resourceId: resource.id,
                startTime:  form.startTime + ':00',
                endTime:    form.endTime   + ':00',
                purpose:    form.purpose,
                attendees:  form.attendees ? parseInt(form.attendees, 10) : null,
            });
            setSubmitted(true);
            setTimeout(() => onSuccess?.(), 2200);
        } catch (err) {
            const msg =
                err.response?.status === 409
                    ? 'This time slot conflicts with an existing approved booking. Please choose a different time.'
                    : err.response?.data?.message || 'Failed to submit booking request.';
            setError(msg);
        } finally {
            setSubmitting(false);
        }
    };

    const set = (key) => (e) => setForm(prev => ({ ...prev, [key]: e.target.value }));

    return (
        <div
            style={{
                position: 'fixed', inset: 0,
                background: 'rgba(15, 23, 42, 0.6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                zIndex: 1200, padding: '1rem',
                backdropFilter: 'blur(3px)',
            }}
            onClick={onClose}
        >
            <div
                style={{
                    background: '#fff',
                    borderRadius: '16px',
                    width: '100%',
                    maxWidth: '560px',
                    maxHeight: '93vh',
                    overflowY: 'auto',
                    boxShadow: '0 32px 80px rgba(15, 23, 42, 0.25)',
                    animation: 'bfm-slide-in 0.2s ease',
                }}
                onClick={e => e.stopPropagation()}
            >
                {/* ── Resource banner ── */}
                <div style={{
                    background: `linear-gradient(135deg, ${meta.bg} 0%, #ffffff 100%)`,
                    borderRadius: '16px 16px 0 0',
                    padding: '22px 24px 18px',
                    borderBottom: '1px solid #e2e8f0',
                    position: 'relative',
                }}>
                    <button
                        type="button"
                        onClick={onClose}
                        style={{
                            position: 'absolute', top: '16px', right: '16px',
                            background: 'rgba(255,255,255,0.9)',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px', width: '34px', height: '34px',
                            cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#475569',
                        }}
                    >
                        <X size={16} />
                    </button>

                    <span style={{
                        display: 'inline-block',
                        background: meta.bg, color: meta.color,
                        fontSize: '11px', fontWeight: '800',
                        padding: '3px 10px', borderRadius: '999px',
                        textTransform: 'uppercase', letterSpacing: '0.04em',
                        marginBottom: '8px',
                    }}>
                        {meta.label}
                    </span>

                    <h2 style={{
                        margin: '0 40px 10px 0',
                        fontSize: '20px', fontWeight: '800', color: '#0f172a',
                    }}>
                        {resource.name}
                    </h2>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', fontSize: '13px', color: '#475569' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <MapPin size={13} color="#64748b" /> {resource.location}
                            {resource.building ? `, ${resource.building}` : ''}
                        </span>
                        {resource.capacity && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <Users size={13} color="#64748b" /> {resource.capacity} capacity
                            </span>
                        )}
                        {resource.availabilityStart && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <Clock size={13} color="#64748b" />
                                {resource.availabilityStart} – {resource.availabilityEnd}
                            </span>
                        )}
                    </div>
                </div>

                {/* ── Body ── */}
                {submitted ? (
                    /* Success state */
                    <div style={{ padding: '56px 32px', textAlign: 'center' }}>
                        <div style={{
                            width: '72px', height: '72px', borderRadius: '50%',
                            background: '#f0fdf4',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 18px',
                        }}>
                            <CheckCircle size={36} color="#15803d" />
                        </div>
                        <h3 style={{ margin: '0 0 10px', fontSize: '20px', fontWeight: '800', color: '#0f172a' }}>
                            Request Submitted!
                        </h3>
                        <p style={{ margin: 0, fontSize: '14px', color: '#64748b', lineHeight: 1.7, maxWidth: '320px', marginInline: 'auto' }}>
                            Your booking request for <strong>{resource.name}</strong> is now{' '}
                            <span style={{ color: '#c2410c', fontWeight: '700' }}>pending admin approval</span>.
                            You'll be notified once it's reviewed.
                        </p>
                    </div>
                ) : (
                    /* Booking form */
                    <div style={{ padding: '24px' }}>
                        <p style={{ margin: '0 0 20px', fontSize: '13px', color: '#64748b', lineHeight: 1.6 }}>
                            Fill in the details below. Your request will be reviewed by an administrator before it's confirmed.
                        </p>

                        {/* Error */}
                        {error && (
                            <div style={alertStyle('#fef2f2', '#fecaca', '#dc2626')}>
                                <AlertCircle size={15} style={{ flexShrink: 0 }} />
                                {error}
                            </div>
                        )}

                        {/* Checking */}
                        {checkingConflicts && form.startTime && form.endTime && (
                            <div style={alertStyle('#f0f9ff', '#bae6fd', '#0369a1')}>
                                <Info size={14} style={{ flexShrink: 0 }} /> Checking availability…
                            </div>
                        )}

                        {/* Conflict warning */}
                        {!checkingConflicts && conflictSlots.length > 0 && (
                            <div style={alertStyle('#fff7ed', '#fed7aa', '#c2410c')}>
                                <AlertCircle size={15} style={{ flexShrink: 0 }} />
                                <span>
                                    <strong>Conflict: </strong>
                                    {conflictSlots.length} booking{conflictSlots.length > 1 ? 's' : ''} already exist in this window.
                                    First overlap: {fmtSlot(conflictSlots[0].startTime)} – {new Date(conflictSlots[0].endTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}.
                                    Your request may be rejected.
                                </span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            {/* Date/time row */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
                                <Field label="Start Date & Time *">
                                    <input
                                        type="datetime-local"
                                        value={form.startTime}
                                        min={nowLocal}
                                        onChange={set('startTime')}
                                        required
                                        style={inputStyle}
                                        onFocus={focusInput}
                                        onBlur={blurInput}
                                    />
                                </Field>
                                <Field label="End Date & Time *">
                                    <input
                                        type="datetime-local"
                                        value={form.endTime}
                                        min={form.startTime || nowLocal}
                                        onChange={set('endTime')}
                                        required
                                        style={inputStyle}
                                        onFocus={focusInput}
                                        onBlur={blurInput}
                                    />
                                </Field>
                            </div>

                            {/* Purpose */}
                            <Field label="Purpose *" style={{ marginBottom: '16px' }}>
                                <textarea
                                    value={form.purpose}
                                    onChange={set('purpose')}
                                    placeholder="e.g. Team meeting, Lecture for CS301, Lab practical session…"
                                    required
                                    maxLength={500}
                                    rows={3}
                                    style={{ ...inputStyle, resize: 'vertical', lineHeight: '1.55' }}
                                    onFocus={focusInput}
                                    onBlur={blurInput}
                                />
                                <span style={{ fontSize: '11px', color: '#94a3b8', float: 'right', marginTop: '3px' }}>
                                    {form.purpose.length}/500
                                </span>
                            </Field>

                            {/* Attendees */}
                            <Field
                                label={`Number of Attendees${resource.capacity ? ` (max ${resource.capacity})` : ' (optional)'}`}
                                style={{ marginBottom: '24px' }}
                            >
                                <input
                                    type="number"
                                    value={form.attendees}
                                    onChange={set('attendees')}
                                    min={1}
                                    max={resource.capacity || undefined}
                                    placeholder={resource.capacity ? `1 – ${resource.capacity}` : 'Optional'}
                                    style={inputStyle}
                                    onFocus={focusInput}
                                    onBlur={blurInput}
                                />
                            </Field>

                            {/* Actions */}
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    style={{
                                        flex: 1, padding: '12px',
                                        borderRadius: '10px',
                                        border: '1px solid #e2e8f0',
                                        background: '#f8fafc',
                                        cursor: 'pointer',
                                        fontSize: '14px', fontWeight: '700', color: '#334155',
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    style={{
                                        flex: 2, padding: '12px',
                                        borderRadius: '10px', border: 'none',
                                        background: submitting ? '#6ee7b7' : '#10b981',
                                        cursor: submitting ? 'not-allowed' : 'pointer',
                                        fontSize: '14px', fontWeight: '700', color: '#fff',
                                        display: 'flex', alignItems: 'center',
                                        justifyContent: 'center', gap: '8px',
                                        transition: 'background 0.15s',
                                    }}
                                    onMouseEnter={e => { if (!submitting) e.currentTarget.style.background = '#059669'; }}
                                    onMouseLeave={e => { if (!submitting) e.currentTarget.style.background = '#10b981'; }}
                                >
                                    <Calendar size={16} />
                                    {submitting ? 'Submitting…' : 'Submit Booking Request'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>

            <style>{`
                @keyframes bfm-slide-in {
                    from { opacity: 0; transform: translateY(18px) scale(0.97); }
                    to   { opacity: 1; transform: translateY(0)    scale(1);    }
                }
            `}</style>
        </div>
    );
}

// ── Small helpers ────────────────────────────────────────────────────────────

function Field({ label, children, style }) {
    return (
        <div style={style}>
            <label style={{
                display: 'block',
                fontSize: '13px', fontWeight: '700', color: '#334155',
                marginBottom: '6px',
            }}>
                {label}
            </label>
            {children}
        </div>
    );
}

function alertStyle(bg, border, color) {
    return {
        display: 'flex', alignItems: 'flex-start', gap: '8px',
        padding: '10px 12px',
        background: bg, border: `1px solid ${border}`, borderRadius: '8px',
        marginBottom: '14px', fontSize: '13px', color,
        lineHeight: 1.5,
    };
}

const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#0f172a',
    background: '#f9fafb',
    boxSizing: 'border-box',
    outline: 'none',
    transition: 'border-color 0.15s, background 0.15s',
    display: 'block',
};

const focusInput = (e) => {
    e.target.style.borderColor = '#10b981';
    e.target.style.background  = '#fff';
};

const blurInput = (e) => {
    e.target.style.borderColor = '#d1d5db';
    e.target.style.background  = '#f9fafb';
};

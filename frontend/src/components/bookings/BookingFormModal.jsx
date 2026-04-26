import React, { useState, useEffect } from 'react';
import { AlertCircle, Calendar, CheckCircle, Clock, MapPin, Users, X } from 'lucide-react';
import { createBooking, getResourceAvailability } from '../../api/bookingApi';

const TYPE_META = {
    LECTURE_HALL: { label: 'Lecture Hall', color: '#7c3aed', bg: '#f3e8ff' },
    LAB:          { label: 'Laboratory',   color: '#0284c7', bg: '#e0f2fe' },
    MEETING_ROOM: { label: 'Meeting Room', color: '#0f766e', bg: '#ccfbf1' },
    EQUIPMENT:    { label: 'Equipment',    color: '#c2410c', bg: '#ffedd5' },
};

const SLOT_MIN = 60;

function generateSlots(availStart, availEnd) {
    const parse = (s, fallback) => {
        if (!s) return fallback;
        const [h, m] = s.split(':').map(Number);
        return h * 60 + (m || 0);
    };
    const startMin = parse(availStart, 7 * 60);
    const endMin   = parse(availEnd,   22 * 60);
    const result   = [];
    for (let t = startMin; t + SLOT_MIN <= endMin; t += SLOT_MIN) {
        const h = Math.floor(t / 60);
        const m = t % 60;
        result.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
    }
    return result;
}

function addMin(slot, min) {
    const [h, m] = slot.split(':').map(Number);
    const total  = h * 60 + m + min;
    return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

function toISO(date, slot) {
    return `${date}T${slot}:00`;
}

/**
 * Props:
 *   resource  – resource object to book
 *   prefilledDate – optional pre-filled date (YYYY-MM-DD)
 *   prefilledStartTime – optional pre-filled start time (HH:MM)
 *   prefilledEndTime – optional pre-filled end time (HH:MM)
 *   onClose   – called when user dismisses
 *   onSuccess – called after successful submission
 */
export default function BookingFormModal({ resource, prefilledDate = '', prefilledStartTime = '', prefilledEndTime = '', onClose, onSuccess }) {
    const [selectedDate, setSelectedDate] = useState(prefilledDate);
    const [startSlot, setStartSlot]       = useState(prefilledStartTime || null);
    const [endSlot, setEndSlot]           = useState(prefilledEndTime || null);
    const [dayBookings, setDayBookings]   = useState([]);
    const [loadingDay, setLoadingDay]     = useState(false);
    const [purpose, setPurpose]           = useState('');
    const [attendees, setAttendees]       = useState('');
    const [submitting, setSubmitting]     = useState(false);
    const [submitted, setSubmitted]       = useState(false);
    const [error, setError]               = useState('');

    const meta  = TYPE_META[resource?.type] || TYPE_META.EQUIPMENT;
    const today = new Date().toISOString().split('T')[0];
    const slots = generateSlots(resource?.availabilityStart, resource?.availabilityEnd);

    // Fetch booked slots for selected date
    useEffect(() => {
        if (!selectedDate) { setDayBookings([]); return; }
        let cancelled = false;
        setLoadingDay(true);
        setStartSlot(null);
        setEndSlot(null);
        getResourceAvailability(
            resource.id,
            `${selectedDate}T00:00:00`,
            `${selectedDate}T23:59:59`
        )
            .then(res => { if (!cancelled) setDayBookings(res.data?.data || []); })
            .catch(()  => { if (!cancelled) setDayBookings([]); })
            .finally(() => { if (!cancelled) setLoadingDay(false); });
        return () => { cancelled = true; };
    }, [selectedDate, resource.id]);

    const isBooked = (slot) => {
        if (!selectedDate) return false;
        const s = new Date(toISO(selectedDate, slot));
        const e = new Date(toISO(selectedDate, addMin(slot, SLOT_MIN)));
        return dayBookings.some(b => new Date(b.startTime) < e && new Date(b.endTime) > s);
    };

    const isPast = (slot) =>
        !selectedDate || new Date(toISO(selectedDate, slot)) <= new Date();

    const slotIdx = (slot) => slots.indexOf(slot);

    const inRange = (slot) => {
        if (!startSlot) return false;
        const si = slotIdx(slot);
        const ai = slotIdx(startSlot);
        const bi = endSlot ? slotIdx(endSlot) : ai;
        return si >= Math.min(ai, bi) && si <= Math.max(ai, bi);
    };

    const handleSlotClick = (slot) => {
        if (isBooked(slot) || isPast(slot)) return;
        setError('');
        if (!startSlot || (startSlot && endSlot)) {
            setStartSlot(slot);
            setEndSlot(null);
        } else {
            if (slot === startSlot) { setStartSlot(null); return; }
            const ci = slotIdx(slot);
            const si = slotIdx(startSlot);
            if (ci < si) { setStartSlot(slot); setEndSlot(null); }
            else         { setEndSlot(slot); }
        }
    };

    const hasConflict = !!(startSlot && selectedDate && dayBookings.some(b => {
        const s = new Date(toISO(selectedDate, startSlot));
        const e = new Date(toISO(selectedDate, addMin(endSlot || startSlot, SLOT_MIN)));
        return new Date(b.startTime) < e && new Date(b.endTime) > s;
    }));

    const durationHours = startSlot
        ? (endSlot ? slotIdx(endSlot) - slotIdx(startSlot) + 1 : 1)
        : 0;

    const endDisplay = startSlot
        ? addMin(endSlot || startSlot, SLOT_MIN)
        : null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedDate || !startSlot) {
            setError('Please select a date and at least one time slot.');
            return;
        }
        setError('');
        setSubmitting(true);
        try {
            await createBooking({
                resourceId: resource.id,
                startTime:  toISO(selectedDate, startSlot),
                endTime:    toISO(selectedDate, addMin(endSlot || startSlot, SLOT_MIN)),
                purpose,
                attendees:  attendees ? parseInt(attendees, 10) : null,
            });
            setSubmitted(true);
            setTimeout(() => onSuccess?.(), 2200);
        } catch (err) {
            setError(
                err.response?.status === 409
                    ? 'This slot conflicts with an existing approved booking. Please choose a different time.'
                    : err.response?.data?.message || 'Failed to submit booking request.'
            );
        } finally {
            setSubmitting(false);
        }
    };

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
                    maxWidth: '580px',
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
                    <button type="button" onClick={onClose} style={{
                        position: 'absolute', top: '16px', right: '16px',
                        background: 'rgba(255,255,255,0.9)', border: '1px solid #e2e8f0',
                        borderRadius: '8px', width: '34px', height: '34px',
                        cursor: 'pointer', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', color: '#475569',
                    }}>
                        <X size={16} />
                    </button>

                    <span style={{
                        display: 'inline-block', background: meta.bg, color: meta.color,
                        fontSize: '11px', fontWeight: '800', padding: '3px 10px',
                        borderRadius: '999px', textTransform: 'uppercase',
                        letterSpacing: '0.04em', marginBottom: '8px',
                    }}>
                        {meta.label}
                    </span>

                    <h2 style={{ margin: '0 40px 10px 0', fontSize: '20px', fontWeight: '800', color: '#0f172a' }}>
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
                    <div style={{ padding: '56px 32px', textAlign: 'center' }}>
                        <div style={{
                            width: '72px', height: '72px', borderRadius: '50%',
                            background: '#f0fdf4', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', margin: '0 auto 18px',
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
                    <div style={{ padding: '24px' }}>

                        {/* ── Step 1: Date ── */}
                        <Field label="Select Date *" style={{ marginBottom: '20px' }}>
                            <input
                                type="date"
                                value={selectedDate}
                                min={today}
                                onChange={e => setSelectedDate(e.target.value)}
                                required
                                style={inputStyle}
                                onFocus={focusInput}
                                onBlur={blurInput}
                            />
                        </Field>

                        {/* ── Step 2: Slot grid ── */}
                        {selectedDate && (
                            <div style={{ marginBottom: '20px' }}>
                                {/* Header row */}
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                                    <span style={{ fontSize: '13px', fontWeight: '700', color: '#334155', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <Clock size={14} color="#64748b" /> Select Time Slot *
                                    </span>
                                    {startSlot && (
                                        <span style={{
                                            fontSize: '12px', fontWeight: '800',
                                            color: '#fff', background: '#10b981',
                                            padding: '3px 10px', borderRadius: '999px',
                                        }}>
                                            {startSlot} – {endDisplay}
                                            {durationHours > 1 ? ` · ${durationHours}h` : ' · 1h'}
                                        </span>
                                    )}
                                </div>

                                {/* Legend */}
                                <div style={{ display: 'flex', gap: '14px', marginBottom: '10px', fontSize: '11px', color: '#64748b' }}>
                                    {[
                                        { bg: '#f1f5f9', border: '#e2e8f0', label: 'Available' },
                                        { bg: '#10b981', border: '#059669', label: 'Selected', color: '#fff' },
                                        { bg: '#fee2e2', border: '#fca5a5', label: 'Booked' },
                                    ].map(({ bg, border, label, color }) => (
                                        <span key={label} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                            <span style={{
                                                width: '13px', height: '13px', borderRadius: '3px',
                                                background: bg, border: `1px solid ${border}`,
                                                display: 'inline-block', flexShrink: 0,
                                            }} />
                                            {label}
                                        </span>
                                    ))}
                                </div>

                                {loadingDay ? (
                                    <div style={{ padding: '28px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
                                        Checking availability…
                                    </div>
                                ) : (
                                    <>
                                        <div style={{
                                            display: 'grid',
                                            gridTemplateColumns: 'repeat(auto-fill, minmax(70px, 1fr))',
                                            gap: '6px',
                                        }}>
                                            {slots.map(slot => {
                                                const booked   = isBooked(slot);
                                                const past     = isPast(slot);
                                                const disabled = booked || past;
                                                const sel      = inRange(slot);

                                                let bg     = '#f1f5f9';
                                                let color  = '#475569';
                                                let border = '1px solid #e2e8f0';

                                                if (booked) {
                                                    bg = '#fee2e2'; color = '#ef4444'; border = '1px solid #fca5a5';
                                                } else if (past) {
                                                    bg = '#f8fafc'; color = '#cbd5e1'; border = '1px solid #f1f5f9';
                                                } else if (sel) {
                                                    bg = '#10b981'; color = '#fff'; border = '1px solid #059669';
                                                }

                                                return (
                                                    <button
                                                        key={slot}
                                                        type="button"
                                                        disabled={disabled}
                                                        onClick={() => handleSlotClick(slot)}
                                                        style={{
                                                            padding: '9px 4px',
                                                            borderRadius: '8px',
                                                            border,
                                                            background: bg,
                                                            color,
                                                            fontSize: '12px',
                                                            fontWeight: sel ? '800' : '600',
                                                            cursor: disabled ? 'not-allowed' : 'pointer',
                                                            textAlign: 'center',
                                                            opacity: (past && !booked) ? 0.35 : 1,
                                                            transition: 'all 0.12s',
                                                            lineHeight: 1.3,
                                                        }}
                                                        title={
                                                            booked ? 'Already booked'
                                                            : past  ? 'Time has passed'
                                                            : `Select ${slot}`
                                                        }
                                                        onMouseEnter={e => {
                                                            if (!disabled && !sel) {
                                                                e.currentTarget.style.background    = '#d1fae5';
                                                                e.currentTarget.style.borderColor   = '#6ee7b7';
                                                                e.currentTarget.style.color         = '#065f46';
                                                            }
                                                        }}
                                                        onMouseLeave={e => {
                                                            if (!disabled && !sel) {
                                                                e.currentTarget.style.background    = bg;
                                                                e.currentTarget.style.borderColor   = '#e2e8f0';
                                                                e.currentTarget.style.color         = color;
                                                            }
                                                        }}
                                                    >
                                                        {slot}
                                                        {booked && (
                                                            <span style={{ display: 'block', fontSize: '9px', marginTop: '2px', opacity: 0.85 }}>
                                                                Booked
                                                            </span>
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        {startSlot && !endSlot && (
                                            <p style={{ margin: '8px 0 0', fontSize: '12px', color: '#64748b' }}>
                                                Click another slot to extend the booking, or proceed for a 1-hour slot.
                                            </p>
                                        )}
                                    </>
                                )}
                            </div>
                        )}

                        {/* ── Alerts ── */}
                        {error && (
                            <div style={alertStyle('#fef2f2', '#fecaca', '#dc2626')}>
                                <AlertCircle size={15} style={{ flexShrink: 0 }} />
                                {error}
                            </div>
                        )}

                        {hasConflict && (
                            <div style={alertStyle('#fff7ed', '#fed7aa', '#c2410c')}>
                                <AlertCircle size={15} style={{ flexShrink: 0 }} />
                                <span>
                                    <strong>Conflict warning: </strong>
                                    Your selected range overlaps with an existing approved booking.
                                    Your request may be rejected by the administrator.
                                </span>
                            </div>
                        )}

                        {/* ── Form fields ── */}
                        <form onSubmit={handleSubmit}>
                            <Field label="Purpose *" style={{ marginBottom: '16px' }}>
                                <textarea
                                    value={purpose}
                                    onChange={e => setPurpose(e.target.value)}
                                    placeholder="e.g. Team meeting, Lecture for CS301, Lab practical session…"
                                    required
                                    maxLength={500}
                                    rows={3}
                                    style={{ ...inputStyle, resize: 'vertical', lineHeight: '1.55' }}
                                    onFocus={focusInput}
                                    onBlur={blurInput}
                                />
                                <span style={{ fontSize: '11px', color: '#94a3b8', float: 'right', marginTop: '3px' }}>
                                    {purpose.length}/500
                                </span>
                            </Field>

                            <Field
                                label={`Number of Attendees${resource.capacity ? ` (max ${resource.capacity})` : ' (optional)'}`}
                                style={{ marginBottom: '24px' }}
                            >
                                <input
                                    type="number"
                                    value={attendees}
                                    onChange={e => setAttendees(e.target.value)}
                                    min={1}
                                    max={resource.capacity || undefined}
                                    placeholder={resource.capacity ? `1 – ${resource.capacity}` : 'Optional'}
                                    style={inputStyle}
                                    onFocus={focusInput}
                                    onBlur={blurInput}
                                />
                            </Field>

                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    style={{
                                        flex: 1, padding: '12px',
                                        borderRadius: '10px', border: '1px solid #e2e8f0',
                                        background: '#f8fafc', cursor: 'pointer',
                                        fontSize: '14px', fontWeight: '700', color: '#334155',
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting || !startSlot}
                                    style={{
                                        flex: 2, padding: '12px',
                                        borderRadius: '10px', border: 'none',
                                        background: (!startSlot || submitting) ? '#6ee7b7' : '#10b981',
                                        cursor: (!startSlot || submitting) ? 'not-allowed' : 'pointer',
                                        fontSize: '14px', fontWeight: '700', color: '#fff',
                                        display: 'flex', alignItems: 'center',
                                        justifyContent: 'center', gap: '8px',
                                        transition: 'background 0.15s',
                                    }}
                                    onMouseEnter={e => { if (startSlot && !submitting) e.currentTarget.style.background = '#059669'; }}
                                    onMouseLeave={e => { if (startSlot && !submitting) e.currentTarget.style.background = '#10b981'; }}
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

// ── Helpers ──────────────────────────────────────────────────────────────────

function Field({ label, children, style }) {
    return (
        <div style={style}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
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
        marginBottom: '14px', fontSize: '13px', color, lineHeight: 1.5,
    };
}

const inputStyle = {
    width: '100%', padding: '10px 12px',
    border: '1px solid #d1d5db', borderRadius: '8px',
    fontSize: '14px', color: '#0f172a', background: '#f9fafb',
    boxSizing: 'border-box', outline: 'none', display: 'block',
    transition: 'border-color 0.15s, background 0.15s',
};

const focusInput = (e) => { e.target.style.borderColor = '#10b981'; e.target.style.background = '#fff'; };
const blurInput  = (e) => { e.target.style.borderColor = '#d1d5db'; e.target.style.background = '#f9fafb'; };

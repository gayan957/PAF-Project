import React, { useState } from 'react';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const FULL_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

function timeToHour(timeStr) {
  if (!timeStr) return 0;
  return parseInt(timeStr.split(':')[0]);
}

function formatHour(hour) {
  if (hour === 0) return '12 AM';
  if (hour < 12) return `${hour} AM`;
  if (hour === 12) return '12 PM';
  return `${hour - 12} PM`;
}

export default function ResourceAvailabilityCalendar({ resource }) {
  const [hoveredCell, setHoveredCell] = useState(null);
  const startHour = timeToHour(resource.availabilityStart);
  const endHour = timeToHour(resource.availabilityEnd);
  const isActive = resource.status === 'ACTIVE';

  const getSlotStatus = (hour) => {
    if (!isActive) return 'inactive';
    if (hour >= startHour && hour < endHour) return 'available';
    return 'closed';
  };

  const slotColors = {
    available: { bg: '#dcfce7', border: '#86efac', text: '#15803d' },
    closed: { bg: '#f9fafb', border: '#e5e7eb', text: '#9ca3af' },
    inactive: { bg: '#fee2e2', border: '#fca5a5', text: '#dc2626' },
  };

  return (
    <div style={{
      background: '#fff',
      border: '1px solid #e0e0e0',
      borderRadius: '12px',
      padding: '24px',
      marginTop: '20px',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#111' }}>
            📅 Weekly Availability
          </h3>
          <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#888' }}>
            Available: {resource.availabilityStart} – {resource.availabilityEnd} daily
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px', fontSize: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '2px', background: '#dcfce7', border: '1px solid #86efac' }} />
            <span style={{ color: '#555' }}>Available</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '2px', background: '#f9fafb', border: '1px solid #e5e7eb' }} />
            <span style={{ color: '#555' }}>Closed</span>
          </div>
          {!isActive && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '2px', background: '#fee2e2', border: '1px solid #fca5a5' }} />
              <span style={{ color: '#555' }}>Unavailable</span>
            </div>
          )}
        </div>
      </div>

      {!isActive && (
        <div style={{
          background: '#fef3c7', border: '1px solid #fde68a',
          borderRadius: '8px', padding: '10px 14px',
          fontSize: '13px', color: '#92400e', marginBottom: '16px',
          display: 'flex', alignItems: 'center', gap: '8px',
        }}>
          ⚠️ This resource is <strong>{resource.status?.replace(/_/g, ' ')}</strong> — booking unavailable
        </div>
      )}

      {/* Calendar grid */}
      <div style={{ overflowX: 'auto' }}>
        <div style={{ minWidth: '500px' }}>
          {/* Day headers */}
          <div style={{ display: 'grid', gridTemplateColumns: '60px repeat(7, 1fr)', gap: '3px', marginBottom: '3px' }}>
            <div />
            {DAYS.map((day, i) => (
              <div key={day} style={{
                textAlign: 'center', fontSize: '12px', fontWeight: '600',
                color: i >= 5 ? '#6366f1' : '#374151', padding: '4px 0',
              }}>
                {day}
              </div>
            ))}
          </div>

          {/* Hour rows */}
          {HOURS.map(hour => {
            const status = getSlotStatus(hour);
            const colors = slotColors[status];
            const showLabel = hour % 3 === 0;

            return (
              <div key={hour} style={{
                display: 'grid',
                gridTemplateColumns: '60px repeat(7, 1fr)',
                gap: '3px',
                marginBottom: '2px',
              }}>
                {/* Hour label */}
                <div style={{
                  fontSize: '10px', color: '#9ca3af',
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'flex-end', paddingRight: '8px',
                  fontWeight: showLabel ? '600' : '400',
                  color: showLabel ? '#6b7280' : '#d1d5db',
                }}>
                  {showLabel ? formatHour(hour) : ''}
                </div>

                {/* Day cells */}
                {DAYS.map((day, dayIndex) => {
                  const cellKey = `${day}-${hour}`;
                  const isHovered = hoveredCell === cellKey;
                  const isWeekend = dayIndex >= 5;

                  return (
                    <div
                      key={day}
                      onMouseEnter={() => setHoveredCell(cellKey)}
                      onMouseLeave={() => setHoveredCell(null)}
                      title={`${FULL_DAYS[dayIndex]} ${formatHour(hour)} — ${status === 'available' ? 'Available for booking' : status === 'closed' ? 'Outside availability hours' : 'Resource unavailable'}`}
                      style={{
                        height: '16px',
                        borderRadius: '3px',
                        background: isHovered && status === 'available'
                          ? '#86efac'
                          : isWeekend && status === 'available'
                            ? '#d1fae5'
                            : colors.bg,
                        border: `1px solid ${isHovered ? '#4ade80' : colors.border}`,
                        cursor: status === 'available' ? 'pointer' : 'default',
                        transition: 'all 0.1s',
                      }}
                    />
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary */}
      <div style={{
        marginTop: '16px', padding: '12px 16px',
        background: '#f8fafc', borderRadius: '8px',
        display: 'flex', gap: '24px', fontSize: '13px',
      }}>
        <div>
          <span style={{ color: '#888' }}>Daily hours: </span>
          <strong style={{ color: '#111' }}>{endHour - startHour} hours</strong>
        </div>
        <div>
          <span style={{ color: '#888' }}>Weekly hours: </span>
          <strong style={{ color: '#111' }}>{(endHour - startHour) * 7} hours</strong>
        </div>
        <div>
          <span style={{ color: '#888' }}>Opens: </span>
          <strong style={{ color: '#111' }}>{resource.availabilityStart}</strong>
        </div>
        <div>
          <span style={{ color: '#888' }}>Closes: </span>
          <strong style={{ color: '#111' }}>{resource.availabilityEnd}</strong>
        </div>
      </div>
    </div>
  );
}
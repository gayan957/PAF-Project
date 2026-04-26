import React, { useState } from 'react';
import { AlertTriangle, CalendarDays } from 'lucide-react';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const FULL_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const HOURS = Array.from({ length: 24 }, (_, index) => index);

function timeToHour(timeStr) {
  if (!timeStr) return 0;
  return Number(timeStr.split(':')[0]);
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
    if (hour >= startHour && hour < endHour) return 'open';
    return 'closed';
  };

  const slotColors = {
    open: { bg: '#dcfce7', border: '#86efac' },
    closed: { bg: '#f8fafc', border: '#e2e8f0' },
    inactive: { bg: '#fee2e2', border: '#fca5a5' },
  };

  const dailyHours = Math.max(0, endHour - startHour);

  return (
    <div style={{
      background: '#fff',
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      padding: '22px',
      marginTop: '20px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '18px', marginBottom: '18px' }}>
        <div>
          <h3 style={{
            margin: 0,
            fontSize: '16px',
            fontWeight: '800',
            color: '#0f172a',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <CalendarDays size={18} color="#0f766e" />
            Operating Window
          </h3>
          <p style={{ margin: '5px 0 0', fontSize: '13px', color: '#64748b' }}>
            Standard open hours: {resource.availabilityStart} to {resource.availabilityEnd}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', fontSize: '12px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <Legend color="#dcfce7" border="#86efac" label="Open" />
          <Legend color="#f8fafc" border="#e2e8f0" label="Closed" />
          {!isActive && <Legend color="#fee2e2" border="#fca5a5" label="Unavailable" />}
        </div>
      </div>

      {!isActive && (
        <div style={{
          background: '#fff7ed',
          border: '1px solid #fed7aa',
          borderRadius: '8px',
          padding: '11px 14px',
          fontSize: '13px',
          color: '#9a3412',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <AlertTriangle size={16} />
          <span>This facility is currently marked as <strong>{resource.status?.replace(/_/g, ' ')}</strong>.</span>
        </div>
      )}

      <div style={{ overflowX: 'auto' }}>
        <div style={{ minWidth: '520px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '62px repeat(7, 1fr)', gap: '3px', marginBottom: '4px' }}>
            <div />
            {DAYS.map((day, index) => (
              <div key={day} style={{
                textAlign: 'center',
                fontSize: '12px',
                fontWeight: '800',
                color: index >= 5 ? '#0f766e' : '#334155',
                padding: '4px 0',
              }}>
                {day}
              </div>
            ))}
          </div>

          {HOURS.map((hour) => {
            const status = getSlotStatus(hour);
            const colors = slotColors[status];
            const showLabel = hour % 3 === 0;

            return (
              <div key={hour} style={{
                display: 'grid',
                gridTemplateColumns: '62px repeat(7, 1fr)',
                gap: '3px',
                marginBottom: '2px',
              }}>
                <div style={{
                  fontSize: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  paddingRight: '8px',
                  fontWeight: showLabel ? '700' : '400',
                  color: showLabel ? '#64748b' : '#cbd5e1',
                }}>
                  {showLabel ? formatHour(hour) : ''}
                </div>

                {DAYS.map((day, dayIndex) => {
                  const cellKey = `${day}-${hour}`;
                  const isHovered = hoveredCell === cellKey;
                  const isWeekend = dayIndex >= 5;
                  const title = status === 'open'
                    ? `${FULL_DAYS[dayIndex]} ${formatHour(hour)} - open`
                    : status === 'closed'
                      ? `${FULL_DAYS[dayIndex]} ${formatHour(hour)} - outside operating hours`
                      : `${FULL_DAYS[dayIndex]} ${formatHour(hour)} - facility unavailable`;

                  return (
                    <div
                      key={day}
                      onMouseEnter={() => setHoveredCell(cellKey)}
                      onMouseLeave={() => setHoveredCell(null)}
                      title={title}
                      style={{
                        height: '16px',
                        borderRadius: '4px',
                        background: isHovered && status === 'open'
                          ? '#86efac'
                          : isWeekend && status === 'open'
                            ? '#d1fae5'
                            : colors.bg,
                        border: `1px solid ${isHovered ? '#4ade80' : colors.border}`,
                        transition: 'all 0.1s ease',
                      }}
                    />
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      <div style={{
        marginTop: '16px',
        padding: '12px 14px',
        background: '#f8fafc',
        borderRadius: '8px',
        display: 'grid',
        gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
        gap: '10px',
        fontSize: '13px',
      }}>
        <Summary label="Daily hours" value={`${dailyHours}h`} />
        <Summary label="Weekly hours" value={`${dailyHours * 7}h`} />
        <Summary label="Opens" value={resource.availabilityStart} />
        <Summary label="Closes" value={resource.availabilityEnd} />
      </div>
    </div>
  );
}

function Legend({ color, border, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: color, border: `1px solid ${border}` }} />
      <span style={{ color: '#475569', fontWeight: '700' }}>{label}</span>
    </div>
  );
}

function Summary({ label, value }) {
  return (
    <div>
      <div style={{ color: '#64748b', fontSize: '12px', marginBottom: '2px' }}>{label}</div>
      <strong style={{ color: '#0f172a', fontSize: '14px' }}>{value}</strong>
    </div>
  );
}

import React, { useState } from 'react';
import { AlertTriangle, CalendarDays } from 'lucide-react';
import { DAY_OPTIONS, formatDay, getAvailabilityWindows, timeToHour, windowHours } from './resourceAvailability';

const HOURS = Array.from({ length: 24 }, (_, index) => index);

function formatHour(hour) {
  if (hour === 0) return '12 AM';
  if (hour < 12) return `${hour} AM`;
  if (hour === 12) return '12 PM';
  return `${hour - 12} PM`;
}

export default function ResourceAvailabilityCalendar({ resource }) {
  const [hoveredCell, setHoveredCell] = useState(null);
  const windows = getAvailabilityWindows(resource);
  const isActive = resource.status === 'ACTIVE';

  const getSlotStatus = (day, hour) => {
    if (!isActive) return 'inactive';
    const isOpen = windows.some((window) =>
      window.day === day
      && hour >= timeToHour(window.openingTime)
      && hour < timeToHour(window.closingTime)
    );
    return isOpen ? 'open' : 'closed';
  };

  const slotColors = {
    open: { bg: '#dcfce7', border: '#86efac' },
    closed: { bg: '#f8fafc', border: '#e2e8f0' },
    inactive: { bg: '#fee2e2', border: '#fca5a5' },
  };

  const weeklyHours = windows.reduce((total, window) => total + windowHours(window), 0);
  const earliestOpen = windows.map((window) => window.openingTime).sort()[0] || 'N/A';
  const sortedClosingTimes = windows.map((window) => window.closingTime).sort();
  const latestClose = sortedClosingTimes[sortedClosingTimes.length - 1] || 'N/A';

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
            Operating Windows
          </h3>
          <p style={{ margin: '5px 0 0', fontSize: '13px', color: '#64748b' }}>
            {windows.length} configured window{windows.length === 1 ? '' : 's'} across {new Set(windows.map((window) => window.day)).size} day{new Set(windows.map((window) => window.day)).size === 1 ? '' : 's'}
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
            {DAY_OPTIONS.map((day, index) => (
              <div key={day.value} style={{
                textAlign: 'center',
                fontSize: '12px',
                fontWeight: '800',
                color: index >= 5 ? '#0f766e' : '#334155',
                padding: '4px 0',
              }}>
                {day.short}
              </div>
            ))}
          </div>

          {HOURS.map((hour) => (
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
                fontWeight: hour % 3 === 0 ? '700' : '400',
                color: hour % 3 === 0 ? '#64748b' : '#cbd5e1',
              }}>
                {hour % 3 === 0 ? formatHour(hour) : ''}
              </div>

              {DAY_OPTIONS.map((day, dayIndex) => {
                const status = getSlotStatus(day.value, hour);
                const colors = slotColors[status];
                const cellKey = `${day.value}-${hour}`;
                const isHovered = hoveredCell === cellKey;
                const isWeekend = dayIndex >= 5;
                const title = status === 'open'
                  ? `${formatDay(day.value)} ${formatHour(hour)} - open`
                  : status === 'closed'
                    ? `${formatDay(day.value)} ${formatHour(hour)} - outside operating windows`
                    : `${formatDay(day.value)} ${formatHour(hour)} - facility unavailable`;

                return (
                  <div
                    key={day.value}
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
          ))}
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
        <Summary label="Windows" value={windows.length} />
        <Summary label="Weekly hours" value={`${weeklyHours}h`} />
        <Summary label="Earliest open" value={earliestOpen} />
        <Summary label="Latest close" value={latestClose} />
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

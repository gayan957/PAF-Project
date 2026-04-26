import React from 'react';
import { Building2, Clock, DoorOpen, FlaskConical, MapPin, Package, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import { getPrimaryResourceImage } from './resourceImages';

const typeMeta = {
  LECTURE_HALL: { label: 'Lecture Hall', icon: DoorOpen, color: '#7c3aed', bg: '#f3e8ff' },
  LAB:          { label: 'Laboratory',   icon: FlaskConical, color: '#0284c7', bg: '#e0f2fe' },
  MEETING_ROOM: { label: 'Meeting Room', icon: Building2,    color: '#0f766e', bg: '#ccfbf1' },
  EQUIPMENT:    { label: 'Equipment',    icon: Package,       color: '#c2410c', bg: '#ffedd5' },
};

/**
 * Props:
 *   resource – resource object
 *   onBook   – optional callback(resource). When provided, "Book Now" calls onBook(resource)
 *              instead of navigating to /bookings?resourceId=X.
 *              Use this when you want to open a booking modal in-place.
 */
export default function ResourceCard({ resource, onBook }) {
  const navigate = useNavigate();
  const meta     = typeMeta[resource.type] || typeMeta.EQUIPMENT;
  const TypeIcon = meta.icon;
  const primaryImage = getPrimaryResourceImage(resource);

  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        minHeight: '340px',
        transition: 'box-shadow 0.18s ease, transform 0.18s ease, border-color 0.18s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow   = '0 14px 32px rgba(15, 23, 42, 0.10)';
        e.currentTarget.style.transform   = 'translateY(-2px)';
        e.currentTarget.style.borderColor = '#cbd5e1';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow   = 'none';
        e.currentTarget.style.transform   = 'none';
        e.currentTarget.style.borderColor = '#e2e8f0';
      }}
    >
      {primaryImage ? (
        <img
          src={primaryImage}
          alt={resource.name}
          style={{ width: '100%', height: '138px', objectFit: 'cover', background: '#f8fafc' }}
        />
      ) : (
        <div style={{
          height: '138px',
          background: `linear-gradient(135deg, ${meta.bg} 0%, #ffffff 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{
            height: '138px',
            background: `linear-gradient(135deg, ${meta.bg} 0%, #ffffff 100%)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{
              width: '58px', height: '58px', borderRadius: '16px',
              background: '#fff', color: meta.color,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 10px 24px rgba(15, 23, 42, 0.10)',
            }}>
              <TypeIcon size={30} />
            </div>
          </div>
        )}
      </button>

      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
        {/* Status + type badge */}
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', alignItems: 'center' }}>
          <StatusBadge status={resource.status} />
          <span style={{
            fontSize: '11px', color: meta.color, background: meta.bg,
            padding: '4px 8px', borderRadius: '999px', fontWeight: '800', whiteSpace: 'nowrap',
          }}>
            {meta.label}
          </span>
        </div>

        {/* Title → resource detail */}
        <button
          type="button"
          onClick={() => navigate(`/resources/${resource.id}`)}
          style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left' }}
        >
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0f172a', lineHeight: 1.35 }}>
            {resource.name}
          </h3>
          {resource.building && (
            <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '13px' }}>{resource.building}</p>
          )}
        </button>

        {/* Key facts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', marginTop: 'auto' }}>
          <Fact icon={MapPin} text={resource.location} />
          {resource.capacity && <Fact icon={Users} text={`${resource.capacity} capacity`} />}
          {resource.availabilityStart && (
            <Fact icon={Clock} text={`${resource.availabilityStart} to ${resource.availabilityEnd}`} />
          )}
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: '8px', paddingTop: '4px' }}>
          <button
            type="button"
            onClick={() => navigate(`/resources/${resource.id}`)}
            style={{
              flex: 1, padding: '8px 10px',
              borderRadius: '8px', border: '1px solid #e2e8f0',
              background: '#f8fafc', cursor: 'pointer',
              fontSize: '13px', color: '#334155', fontWeight: '700',
            }}
          >
            Details
          </button>

          {isActive ? (
            <button
              type="button"
              onClick={handleBook}
              style={{
                flex: 1, padding: '8px 10px',
                borderRadius: '8px', border: 'none',
                background: '#10b981', cursor: 'pointer',
                fontSize: '13px', color: '#fff', fontWeight: '700',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#059669')}
              onMouseLeave={e => (e.currentTarget.style.background = '#10b981')}
            >
              Book Now
            </button>
          ) : (
            <span style={{
              flex: 1, padding: '8px 10px',
              borderRadius: '8px', border: '1px solid #fecaca',
              background: '#fef2f2', fontSize: '13px',
              color: '#dc2626', fontWeight: '700',
              textAlign: 'center',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              Unavailable
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function Fact({ icon: Icon, text }) {
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475569', fontSize: '13px' }}>
      <Icon size={15} color="#64748b" />
      {text}
    </span>
  );
}

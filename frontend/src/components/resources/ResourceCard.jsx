import React from 'react';
import { Building2, Clock, DoorOpen, FlaskConical, MapPin, Package, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import StatusBadge from './StatusBadge';

const typeMeta = {
  LECTURE_HALL: { label: 'Lecture Hall', icon: DoorOpen, color: '#7c3aed', bg: '#f3e8ff' },
  LAB: { label: 'Laboratory', icon: FlaskConical, color: '#0284c7', bg: '#e0f2fe' },
  MEETING_ROOM: { label: 'Meeting Room', icon: Building2, color: '#0f766e', bg: '#ccfbf1' },
  EQUIPMENT: { label: 'Equipment', icon: Package, color: '#c2410c', bg: '#ffedd5' },
};

export default function ResourceCard({ resource }) {
  const navigate = useNavigate();
  const meta = typeMeta[resource.type] || typeMeta.EQUIPMENT;
  const TypeIcon = meta.icon;

  return (
    <button
      type="button"
      onClick={() => navigate(`/resources/${resource.id}`)}
      style={{
        background: '#fff',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        padding: 0,
        cursor: 'pointer',
        transition: 'box-shadow 0.18s ease, transform 0.18s ease, border-color 0.18s ease',
        display: 'flex',
        flexDirection: 'column',
        textAlign: 'left',
        overflow: 'hidden',
        minHeight: '326px',
      }}
      onMouseEnter={(event) => {
        event.currentTarget.style.boxShadow = '0 14px 32px rgba(15, 23, 42, 0.10)';
        event.currentTarget.style.transform = 'translateY(-2px)';
        event.currentTarget.style.borderColor = '#cbd5e1';
      }}
      onMouseLeave={(event) => {
        event.currentTarget.style.boxShadow = 'none';
        event.currentTarget.style.transform = 'none';
        event.currentTarget.style.borderColor = '#e2e8f0';
      }}
    >
      {resource.imageUrl ? (
        <img
          src={resource.imageUrl}
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
            width: '58px',
            height: '58px',
            borderRadius: '16px',
            background: '#fff',
            color: meta.color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 10px 24px rgba(15, 23, 42, 0.10)',
          }}>
            <TypeIcon size={30} />
          </div>
        </div>
      )}

      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', alignItems: 'center' }}>
          <StatusBadge status={resource.status} />
          <span style={{
            fontSize: '11px',
            color: meta.color,
            background: meta.bg,
            padding: '4px 8px',
            borderRadius: '999px',
            fontWeight: '800',
            letterSpacing: '0',
            whiteSpace: 'nowrap',
          }}>
            {meta.label}
          </span>
        </div>

        <div>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0f172a', lineHeight: 1.35 }}>
            {resource.name}
          </h3>
          {resource.building && (
            <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '13px' }}>{resource.building}</p>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: 'auto' }}>
          <Fact icon={MapPin} text={resource.location} />
          {resource.capacity && <Fact icon={Users} text={`${resource.capacity} capacity`} />}
          {resource.availabilityStart && (
            <Fact icon={Clock} text={`${resource.availabilityStart} to ${resource.availabilityEnd}`} />
          )}
        </div>
      </div>
    </button>
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

import React from 'react';
import { useNavigate } from 'react-router-dom';
import StatusBadge from './StatusBadge';

const typeIcons = {
  LECTURE_HALL: '🏛️',
  LAB: '🔬',
  MEETING_ROOM: '📋',
  EQUIPMENT: '📷',
};

export default function ResourceCard({ resource }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/resources/${resource.id}`)}
      style={{
        background: '#fff',
        border: '1px solid #e0e0e0',
        borderRadius: '12px',
        padding: '20px',
        cursor: 'pointer',
        transition: 'box-shadow 0.2s, transform 0.2s',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.12)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.transform = 'none';
      }}
    >
      {resource.imageUrl ? (
        <img src={resource.imageUrl} alt={resource.name}
          style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '8px' }} />
      ) : (
        <div style={{
          height: '140px', borderRadius: '8px', background: '#f5f5f5',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px',
        }}>
          {typeIcons[resource.type] || '🏢'}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <StatusBadge status={resource.status} />
        <span style={{ fontSize: '12px', color: '#888' }}>
          {resource.type?.replace(/_/g, ' ')}
        </span>
      </div>

      <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#1a1a1a' }}>
        {resource.name}
      </h3>

      <p style={{ margin: 0, fontSize: '13px', color: '#666' }}>
        📍 {resource.location}{resource.building && ` • ${resource.building}`}
      </p>

      {resource.capacity && (
        <p style={{ margin: 0, fontSize: '13px', color: '#666' }}>
          👥 Capacity: {resource.capacity}
        </p>
      )}

      {resource.availabilityStart && (
        <p style={{ margin: 0, fontSize: '13px', color: '#666' }}>
          🕐 {resource.availabilityStart} – {resource.availabilityEnd}
        </p>
      )}
    </div>
  );
}
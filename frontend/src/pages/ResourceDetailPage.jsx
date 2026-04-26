import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getResourceById, updateResourceStatus, deleteResource } from '../api/resourceApi';
import StatusBadge from '../components/resources/StatusBadge';
import ResourceAvailabilityCalendar from '../components/resources/ResourceAvailabilityCalendar';

const typeIcons = {
  LECTURE_HALL: '🏛️',
  LAB: '🔬',
  MEETING_ROOM: '📋',
  EQUIPMENT: '📷',
};

export default function ResourceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusLoading, setStatusLoading] = useState(false);
  const isAdmin = user?.role === 'ROLE_ADMIN';

  useEffect(() => {
    getResourceById(id)
      .then(res => setResource(res.data.data))
      .catch(() => navigate('/resources'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleStatusChange = async (newStatus) => {
    const reason = prompt(`Reason for changing to ${newStatus.replace(/_/g, ' ')}:`);
    if (reason === null) return;
    setStatusLoading(true);
    try {
      const res = await updateResourceStatus(id, newStatus, reason);
      setResource(res.data.data);
    } catch (err) {
      alert('Failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setStatusLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Remove this resource from the catalogue? This action cannot be undone.')) return;
    await deleteResource(id);
    navigate('/resources');
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '32px', marginBottom: '12px' }}>⏳</div>
        <p style={{ color: '#888' }}>Loading resource details...</p>
      </div>
    </div>
  );

  if (!resource) return null;

  return (
    <div style={{ padding: '24px', maxWidth: '1100px', margin: '0 auto' }}>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
        <button onClick={() => navigate('/resources')} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: '#6b7280', fontSize: '14px', padding: 0,
          display: 'flex', alignItems: 'center', gap: '4px',
        }}>
          ← Resources
        </button>
        <span style={{ color: '#d1d5db' }}>/</span>
        <span style={{ fontSize: '14px', color: '#374151', fontWeight: '500' }}>{resource.name}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px' }}>
        {/* Left column */}
        <div>
          {/* Image */}
          {resource.imageUrl ? (
            <img src={resource.imageUrl} alt={resource.name}
              style={{ width: '100%', height: '280px', objectFit: 'cover', borderRadius: '16px', marginBottom: '20px' }} />
          ) : (
            <div style={{
              height: '280px', borderRadius: '16px', marginBottom: '20px',
              background: 'linear-gradient(135deg, #f0f4ff 0%, #e8f0fe 100%)',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: '8px',
            }}>
              <span style={{ fontSize: '72px' }}>{typeIcons[resource.type] || '🏢'}</span>
              <span style={{ fontSize: '14px', color: '#6b7280' }}>{resource.type?.replace(/_/g, ' ')}</span>
            </div>
          )}

          {/* Main info card */}
          <div style={{
            background: '#fff', border: '1px solid #e5e7eb',
            borderRadius: '16px', padding: '24px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <h1 style={{ margin: '0 0 6px', fontSize: '24px', fontWeight: '700', color: '#111' }}>
                  {resource.name}
                </h1>
                <span style={{
                  fontSize: '13px', color: '#6b7280', background: '#f3f4f6',
                  padding: '3px 10px', borderRadius: '20px',
                }}>
                  {resource.type?.replace(/_/g, ' ')}
                </span>
              </div>
              <StatusBadge status={resource.status} />
            </div>

            {resource.statusReason && (
              <div style={{
                background: '#fffbeb', border: '1px solid #fde68a',
                borderRadius: '8px', padding: '10px 14px',
                fontSize: '13px', color: '#92400e', marginBottom: '16px',
              }}>
                📋 {resource.statusReason}
              </div>
            )}

            <hr style={{ border: 'none', borderTop: '1px solid #f0f0f0', margin: '16px 0' }} />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <InfoItem icon="📍" label="Location" value={resource.location} />
              {resource.building && <InfoItem icon="🏢" label="Building" value={resource.building} />}
              {resource.capacity && <InfoItem icon="👥" label="Capacity" value={`${resource.capacity} people`} />}
              <InfoItem icon="🕐" label="Availability" value={`${resource.availabilityStart} – ${resource.availabilityEnd}`} />
              {resource.createdBy && <InfoItem icon="👤" label="Added by" value={resource.createdBy} />}
            </div>

            {resource.description && (
              <>
                <hr style={{ border: 'none', borderTop: '1px solid #f0f0f0', margin: '20px 0' }} />
                <h4 style={{ margin: '0 0 8px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                  About this resource
                </h4>
                <p style={{ margin: 0, fontSize: '14px', color: '#6b7280', lineHeight: '1.7' }}>
                  {resource.description}
                </p>
              </>
            )}
          </div>

          {/* Availability Calendar */}
          <ResourceAvailabilityCalendar resource={resource} />
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Book button */}
          {resource.status === 'ACTIVE' ? (
            <button onClick={() => navigate(`/bookings/new?resourceId=${resource.id}`)} style={{
              padding: '16px', borderRadius: '12px', border: 'none',
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              color: '#fff', fontSize: '15px', fontWeight: '600',
              cursor: 'pointer', width: '100%', boxShadow: '0 4px 12px rgba(37,99,235,0.3)',
              transition: 'transform 0.1s',
            }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'none'}
            >
              📅 Book This Resource
            </button>
          ) : (
            <div style={{
              padding: '16px', borderRadius: '12px',
              background: '#f9fafb', border: '1px solid #e5e7eb',
              textAlign: 'center', fontSize: '14px', color: '#9ca3af',
            }}>
              🚫 Not available for booking
            </div>
          )}

          {/* Resource summary card */}
          <div style={{
            background: '#fff', border: '1px solid #e5e7eb',
            borderRadius: '12px', padding: '18px',
          }}>
            <h4 style={{ margin: '0 0 14px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
              Resource Summary
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
              <SummaryRow label="Type" value={resource.type?.replace(/_/g, ' ')} />
              <SummaryRow label="Status" value={<StatusBadge status={resource.status} />} />
              {resource.capacity && <SummaryRow label="Capacity" value={`${resource.capacity} seats`} />}
              <SummaryRow label="Open from" value={resource.availabilityStart} />
              <SummaryRow label="Open until" value={resource.availabilityEnd} />
              <SummaryRow label="Daily hours" value={`${timeToHour(resource.availabilityEnd) - timeToHour(resource.availabilityStart)}h`} />
            </div>
          </div>

          {/* Admin controls */}
          {isAdmin && (
            <div style={{
              background: '#fff', border: '1px solid #e5e7eb',
              borderRadius: '12px', padding: '18px',
            }}>
              <h4 style={{ margin: '0 0 14px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                🔧 Admin Controls
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button onClick={() => navigate(`/admin/resources`)} style={adminBtn('#2563eb')}>
                  ✏️ Edit Resource
                </button>
                {resource.status !== 'ACTIVE' && (
                  <button onClick={() => handleStatusChange('ACTIVE')} disabled={statusLoading} style={adminBtn('#16a34a')}>
                    ✅ Set Active
                  </button>
                )}
                {resource.status !== 'UNDER_MAINTENANCE' && (
                  <button onClick={() => handleStatusChange('UNDER_MAINTENANCE')} disabled={statusLoading} style={adminBtn('#d97706')}>
                    🔧 Set Maintenance
                  </button>
                )}
                {resource.status !== 'OUT_OF_SERVICE' && (
                  <button onClick={() => handleStatusChange('OUT_OF_SERVICE')} disabled={statusLoading} style={adminBtn('#dc2626')}>
                    ❌ Set Out of Service
                  </button>
                )}
                <hr style={{ border: 'none', borderTop: '1px solid #f0f0f0', margin: '4px 0' }} />
                <button onClick={handleDelete} style={adminBtn('#dc2626')}>
                  🗑️ Remove Resource
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function timeToHour(timeStr) {
  if (!timeStr) return 0;
  return parseInt(timeStr.split(':')[0]);
}

function InfoItem({ icon, label, value }) {
  return (
    <div>
      <p style={{ margin: '0 0 2px', fontSize: '12px', color: '#9ca3af', fontWeight: '500' }}>
        {icon} {label}
      </p>
      <p style={{ margin: 0, fontSize: '14px', color: '#374151', fontWeight: '500' }}>
        {value}
      </p>
    </div>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ color: '#9ca3af' }}>{label}</span>
      <span style={{ color: '#374151', fontWeight: '500' }}>{value}</span>
    </div>
  );
}

function adminBtn(color) {
  return {
    padding: '9px 12px', borderRadius: '8px',
    border: `1px solid ${color}20`,
    color: color, background: `${color}08`,
    cursor: 'pointer', fontSize: '13px',
    textAlign: 'left', transition: 'background 0.15s',
    fontWeight: '500',
  };
}
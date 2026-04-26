import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getResourceById, getQrUrl, updateResourceStatus, deleteResource } from '../api/resourceApi';
import StatusBadge from '../components/resources/StatusBadge';

import { useAuth } from '../context/AuthContext'; 

export default function ResourceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
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
    try {
      const res = await updateResourceStatus(id, newStatus, reason);
      setResource(res.data.data);
    } catch (err) {
      alert('Failed: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Remove this resource from the catalogue?')) return;
    await deleteResource(id);
    navigate('/resources');
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;
  if (!resource) return null;

  return (
    <div style={{ padding: '24px', maxWidth: '900px', margin: '0 auto' }}>
      <button onClick={() => navigate('/resources')} style={{
        background: 'none', border: 'none', cursor: 'pointer',
        color: '#2563eb', fontSize: '14px', marginBottom: '20px', padding: 0,
      }}>
        ← Back to Resources
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px' }}>
        {/* Left */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {resource.imageUrl ? (
            <img src={resource.imageUrl} alt={resource.name}
              style={{ width: '100%', height: '260px', objectFit: 'cover', borderRadius: '12px' }} />
          ) : (
            <div style={{
              height: '260px', borderRadius: '12px', background: '#f0f0f0',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '72px',
            }}>🏢</div>
          )}

          <div style={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: '12px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h1 style={{ margin: '0 0 6px', fontSize: '22px', fontWeight: '700' }}>{resource.name}</h1>
                <p style={{ margin: 0, color: '#888', fontSize: '14px' }}>
                  {resource.type?.replace(/_/g, ' ')}
                </p>
              </div>
              <StatusBadge status={resource.status} />
            </div>

            {resource.statusReason && (
              <p style={{ margin: '12px 0 0', fontSize: '13px', color: '#888', fontStyle: 'italic' }}>
                Note: {resource.statusReason}
              </p>
            )}

            <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '16px 0' }} />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', fontSize: '14px' }}>
              <div>
                <strong>📍 Location</strong>
                <p style={{ margin: '4px 0 0', color: '#555' }}>{resource.location}</p>
              </div>
              {resource.building && (
                <div>
                  <strong>🏢 Building</strong>
                  <p style={{ margin: '4px 0 0', color: '#555' }}>{resource.building}</p>
                </div>
              )}
              {resource.capacity && (
                <div>
                  <strong>👥 Capacity</strong>
                  <p style={{ margin: '4px 0 0', color: '#555' }}>{resource.capacity} people</p>
                </div>
              )}
              <div>
                <strong>🕐 Availability</strong>
                <p style={{ margin: '4px 0 0', color: '#555' }}>
                  {resource.availabilityStart} – {resource.availabilityEnd}
                </p>
              </div>
            </div>

            {resource.description && (
              <>
                <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '16px 0' }} />
                <p style={{ margin: 0, fontSize: '14px', color: '#555', lineHeight: '1.6' }}>
                  {resource.description}
                </p>
              </>
            )}
          </div>
        </div>

        {/* Right */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {resource.status === 'ACTIVE' && (
            <button onClick={() => navigate(`/bookings/new?resourceId=${resource.id}`)} style={{
              padding: '14px', borderRadius: '10px', border: 'none',
              background: '#2563eb', color: '#fff', fontSize: '15px',
              fontWeight: '600', cursor: 'pointer', width: '100%',
            }}>
              Book This Resource
            </button>
          )}

          {/* QR Code */}
          <div style={{
            background: '#fff', border: '1px solid #e0e0e0', borderRadius: '12px',
            padding: '20px', textAlign: 'center',
          }}>
            <p style={{ margin: '0 0 12px', fontWeight: '600', fontSize: '14px' }}>QR Code</p>
            <img src={getQrUrl(resource.id)} alt="QR Code" style={{ width: '160px', height: '160px' }} />
            <p style={{ margin: '8px 0 0', fontSize: '11px', color: '#aaa' }}>Scan at the door to check in</p>
          </div>

          {/* Admin controls */}
          {isAdmin && (
            <div style={{
              background: '#fff', border: '1px solid #e0e0e0',
              borderRadius: '12px', padding: '20px',
            }}>
              <p style={{ margin: '0 0 12px', fontWeight: '600', fontSize: '14px' }}>Admin Controls</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button onClick={() => navigate(`/admin/resources`)} style={{
                  padding: '10px', borderRadius: '8px', border: '1px solid #2563eb',
                  color: '#2563eb', background: '#fff', cursor: 'pointer', fontSize: '13px',
                }}>✏️ Edit Resource</button>

                {resource.status !== 'ACTIVE' && (
                  <button onClick={() => handleStatusChange('ACTIVE')} style={{
                    padding: '10px', borderRadius: '8px', border: '1px solid #22c55e',
                    color: '#16a34a', background: '#fff', cursor: 'pointer', fontSize: '13px',
                  }}>✅ Set Active</button>
                )}
                {resource.status !== 'UNDER_MAINTENANCE' && (
                  <button onClick={() => handleStatusChange('UNDER_MAINTENANCE')} style={{
                    padding: '10px', borderRadius: '8px', border: '1px solid #f59e0b',
                    color: '#b45309', background: '#fff', cursor: 'pointer', fontSize: '13px',
                  }}>🔧 Set Maintenance</button>
                )}
                {resource.status !== 'OUT_OF_SERVICE' && (
                  <button onClick={() => handleStatusChange('OUT_OF_SERVICE')} style={{
                    padding: '10px', borderRadius: '8px', border: '1px solid #ef4444',
                    color: '#dc2626', background: '#fff', cursor: 'pointer', fontSize: '13px',
                  }}>❌ Set Out of Service</button>
                )}
                <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '4px 0' }} />
                <button onClick={handleDelete} style={{
                  padding: '10px', borderRadius: '8px', border: '1px solid #fca5a5',
                  color: '#dc2626', background: '#fff', cursor: 'pointer', fontSize: '13px',
                }}>🗑️ Remove Resource</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
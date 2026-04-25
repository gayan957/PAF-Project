import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getResources, createResource, updateResource, deleteResource, getAnalytics } from '../api/resourceApi';
import ResourceForm from '../components/resources/ResourceForm';
import StatusBadge from '../components/resources/StatusBadge';

export default function AdminResourcesPage() {
  const navigate = useNavigate();
  const [resources, setResources] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchAll = async () => {
    try {
      const [rRes, aRes] = await Promise.all([getResources({ size: 100 }), getAnalytics()]);
      setResources(rRes.data.data.content);
      setAnalytics(aRes.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleCreate = async (data) => {
    setLoading(true);
    try {
      await createResource(data);
      setShowForm(false);
      fetchAll();
    } catch (err) {
      alert('Error: ' + (err.response?.data?.message || err.message));
    } finally { setLoading(false); }
  };

  const handleEdit = async (data) => {
    setLoading(true);
    try {
      await updateResource(editTarget.id, data);
      setEditTarget(null);
      fetchAll();
    } catch (err) {
      alert('Error: ' + (err.response?.data?.message || err.message));
    } finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this resource?')) return;
    await deleteResource(id);
    fetchAll();
  };

  const StatCard = ({ label, value, color }) => (
    <div style={{
      background: '#fff', border: `2px solid ${color}`,
      borderRadius: '12px', padding: '20px', textAlign: 'center',
    }}>
      <div style={{ fontSize: '32px', fontWeight: '700', color }}>{value}</div>
      <div style={{ fontSize: '13px', color: '#666', marginTop: '4px' }}>{label}</div>
    </div>
  );

  const Modal = ({ title, onClose, children }) => (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
      zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        background: '#fff', borderRadius: '16px', padding: '28px',
        width: '600px', maxHeight: '90vh', overflowY: 'auto',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, fontSize: '18px' }}>{title}</h2>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#888',
          }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '700' }}>Manage Resources</h1>
        <button onClick={() => setShowForm(true)} style={{
          padding: '10px 20px', borderRadius: '8px', border: 'none',
          background: '#2563eb', color: '#fff', fontWeight: '600', cursor: 'pointer',
        }}>+ Add Resource</button>
      </div>

      {/* Analytics cards */}
      {analytics && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' }}>
          <StatCard label="Total Resources" value={analytics.totalResources} color="#2563eb" />
          <StatCard label="Active" value={analytics.activeCount} color="#16a34a" />
          <StatCard label="Under Maintenance" value={analytics.underMaintenanceCount} color="#d97706" />
          <StatCard label="Out of Service" value={analytics.outOfServiceCount} color="#dc2626" />
        </div>
      )}

      {showForm && (
        <Modal title="Add New Resource" onClose={() => setShowForm(false)}>
          <ResourceForm loading={loading} onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
        </Modal>
      )}

      {editTarget && (
        <Modal title="Edit Resource" onClose={() => setEditTarget(null)}>
          <ResourceForm initial={editTarget} loading={loading}
            onSubmit={handleEdit} onCancel={() => setEditTarget(null)} />
        </Modal>
      )}

      {/* Resources table */}
      <div style={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: '12px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
          <thead>
            <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #e0e0e0' }}>
              {['Name', 'Type', 'Location', 'Capacity', 'Hours', 'Status', 'Actions'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#555' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {resources.map(r => (
              <tr key={r.id} style={{ borderBottom: '1px solid #f0f0f0' }}
                onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <td style={{ padding: '12px 16px', fontWeight: '500' }}>{r.name}</td>
                <td style={{ padding: '12px 16px', color: '#666' }}>{r.type?.replace(/_/g, ' ')}</td>
                <td style={{ padding: '12px 16px', color: '#666' }}>{r.location}</td>
                <td style={{ padding: '12px 16px', color: '#666' }}>{r.capacity || '—'}</td>
                <td style={{ padding: '12px 16px', color: '#666' }}>
                  {r.availabilityStart} – {r.availabilityEnd}
                </td>
                <td style={{ padding: '12px 16px' }}><StatusBadge status={r.status} /></td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button onClick={() => navigate(`/resources/${r.id}`)} style={{
                      padding: '5px 10px', borderRadius: '6px', border: '1px solid #ddd',
                      background: '#fff', cursor: 'pointer', fontSize: '12px',
                    }}>View</button>
                    <button onClick={() => setEditTarget(r)} style={{
                      padding: '5px 10px', borderRadius: '6px', border: '1px solid #2563eb',
                      color: '#2563eb', background: '#fff', cursor: 'pointer', fontSize: '12px',
                    }}>Edit</button>
                    <button onClick={() => handleDelete(r.id)} style={{
                      padding: '5px 10px', borderRadius: '6px', border: '1px solid #ef4444',
                      color: '#ef4444', background: '#fff', cursor: 'pointer', fontSize: '12px',
                    }}>Remove</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
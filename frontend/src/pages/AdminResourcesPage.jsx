import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getResources, createResource, updateResource,
  deleteResource, getAnalytics
} from '../api/resourceApi';
import ResourceForm from '../components/resources/ResourceForm';
import StatusBadge from '../components/resources/StatusBadge';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend
} from 'recharts';

const TYPE_COLORS = {
  LAB: '#6366f1',
  LECTURE_HALL: '#f59e0b',
  MEETING_ROOM: '#10b981',
  EQUIPMENT: '#ef4444',
};

const STATUS_COLORS = {
  Active: '#16a34a',
  'Under Maintenance': '#d97706',
  'Out of Service': '#dc2626',
};

export default function AdminResourcesPage() {
  const navigate = useNavigate();
  const [resources, setResources] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('resources');

  const fetchAll = async () => {
    try {
      const [rRes, aRes] = await Promise.all([
        getResources({ size: 100 }),
        getAnalytics(),
      ]);
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

  const filteredResources = resources.filter(r =>
    r.name?.toLowerCase().includes(search.toLowerCase()) ||
    r.location?.toLowerCase().includes(search.toLowerCase())
  );

  // Chart data
  const typeChartData = analytics?.countByType
    ? Object.entries(analytics.countByType).map(([name, value]) => ({
        name: name.replace(/_/g, ' '), value,
      }))
    : [];

  const statusChartData = analytics ? [
    { name: 'Active', value: Number(analytics.activeCount) },
    { name: 'Under Maintenance', value: Number(analytics.underMaintenanceCount) },
    { name: 'Out of Service', value: Number(analytics.outOfServiceCount) },
  ].filter(d => d.value > 0) : [];

  const buildingChartData = analytics?.countByBuilding
    ? Object.entries(analytics.countByBuilding).map(([name, value]) => ({ name, value: Number(value) }))
    : [];

  return (
    <div style={{ padding: '24px', maxWidth: '1300px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#111' }}>
            Facilities Management
          </h1>
          <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: '14px' }}>
            Manage campus resources and facilities
          </p>
        </div>
        <button onClick={() => setShowForm(true)} style={{
          padding: '10px 20px', borderRadius: '10px', border: 'none',
          background: '#2563eb', color: '#fff', fontWeight: '600',
          cursor: 'pointer', fontSize: '14px', display: 'flex',
          alignItems: 'center', gap: '6px',
          boxShadow: '0 2px 8px rgba(37,99,235,0.3)',
        }}>
          + Add Resource
        </button>
      </div>

      {/* Stats row */}
      {analytics && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
          {[
            { label: 'Total Resources', value: analytics.totalResources, color: '#2563eb', bg: '#eff6ff', icon: '🏛️' },
            { label: 'Active', value: analytics.activeCount, color: '#16a34a', bg: '#f0fdf4', icon: '✅' },
            { label: 'Under Maintenance', value: analytics.underMaintenanceCount, color: '#d97706', bg: '#fffbeb', icon: '🔧' },
            { label: 'Out of Service', value: analytics.outOfServiceCount, color: '#dc2626', bg: '#fef2f2', icon: '❌' },
          ].map(({ label, value, color, bg, icon }) => (
            <div key={label} style={{
              background: bg, border: `1px solid ${color}20`,
              borderRadius: '12px', padding: '18px',
              display: 'flex', alignItems: 'center', gap: '14px',
            }}>
              <div style={{
                width: '44px', height: '44px', borderRadius: '10px',
                background: '#fff', display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: '20px',
                boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
              }}>
                {icon}
              </div>
              <div>
                <div style={{ fontSize: '26px', fontWeight: '700', color, lineHeight: 1 }}>{value}</div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '3px' }}>{label}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '20px', background: '#f3f4f6', borderRadius: '10px', padding: '4px', width: 'fit-content' }}>
        {['resources', 'analytics'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            padding: '8px 20px', borderRadius: '8px', border: 'none',
            background: activeTab === tab ? '#fff' : 'transparent',
            color: activeTab === tab ? '#111' : '#6b7280',
            fontWeight: activeTab === tab ? '600' : '400',
            cursor: 'pointer', fontSize: '14px',
            boxShadow: activeTab === tab ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            textTransform: 'capitalize',
          }}>
            {tab === 'resources' ? '📋 Resources' : '📊 Analytics'}
          </button>
        ))}
      </div>

      {/* Resources tab */}
      {activeTab === 'resources' && (
        <>
          {/* Search */}
          <div style={{ marginBottom: '16px' }}>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="🔍 Search by name or location..."
              style={{
                width: '300px', padding: '10px 14px',
                border: '1px solid #e5e7eb', borderRadius: '10px',
                fontSize: '14px', outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Table */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e5e7eb' }}>
                  {['Resource', 'Type', 'Location', 'Capacity', 'Hours', 'Status', 'Actions'].map(h => (
                    <th key={h} style={{
                      padding: '12px 16px', textAlign: 'left',
                      fontWeight: '600', color: '#374151', fontSize: '13px',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredResources.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>
                      <div style={{ fontSize: '32px', marginBottom: '8px' }}>📭</div>
                      No resources found
                    </td>
                  </tr>
                ) : filteredResources.map(r => (
                  <tr key={r.id}
                    style={{ borderBottom: '1px solid #f0f0f0', transition: 'background 0.1s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: '600', color: '#111' }}>{r.name}</div>
                      {r.building && <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>{r.building}</div>}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        fontSize: '12px', padding: '3px 8px', borderRadius: '6px',
                        background: `${TYPE_COLORS[r.type] || '#6b7280'}15`,
                        color: TYPE_COLORS[r.type] || '#6b7280',
                        fontWeight: '500',
                      }}>
                        {r.type?.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', color: '#6b7280', fontSize: '13px' }}>{r.location}</td>
                    <td style={{ padding: '14px 16px', color: '#6b7280' }}>{r.capacity ? `${r.capacity} 👥` : '—'}</td>
                    <td style={{ padding: '14px 16px', color: '#6b7280', fontSize: '13px' }}>
                      {r.availabilityStart} – {r.availabilityEnd}
                    </td>
                    <td style={{ padding: '14px 16px' }}><StatusBadge status={r.status} /></td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <ActionBtn onClick={() => navigate(`/resources/${r.id}`)} color="#6b7280">View</ActionBtn>
                        <ActionBtn onClick={() => setEditTarget(r)} color="#2563eb">Edit</ActionBtn>
                        <ActionBtn onClick={() => handleDelete(r.id)} color="#dc2626">Remove</ActionBtn>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Analytics tab */}
      {activeTab === 'analytics' && analytics && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {/* Resources by type - Pie chart */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '20px' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '15px', fontWeight: '600' }}>Resources by Type</h3>
            {typeChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={typeChartData} cx="50%" cy="50%" outerRadius={90}
                    dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}>
                    {typeChartData.map((entry, index) => (
                      <Cell key={index} fill={Object.values(TYPE_COLORS)[index % 4]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : <p style={{ color: '#9ca3af', textAlign: 'center', padding: '40px 0' }}>No data yet</p>}
          </div>

          {/* Status breakdown - Pie chart */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '20px' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '15px', fontWeight: '600' }}>Status Breakdown</h3>
            {statusChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={statusChartData} cx="50%" cy="50%" innerRadius={50} outerRadius={90}
                    dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                    {statusChartData.map((entry, index) => (
                      <Cell key={index} fill={STATUS_COLORS[entry.name] || '#6b7280'} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : <p style={{ color: '#9ca3af', textAlign: 'center', padding: '40px 0' }}>No data yet</p>}
          </div>

          {/* Resources by building - Bar chart */}
          {buildingChartData.length > 0 && (
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '20px', gridColumn: '1 / -1' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '15px', fontWeight: '600' }}>Resources by Building</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={buildingChartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#6366f1" radius={[6, 6, 0, 0]} name="Resources" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Summary table */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '20px', gridColumn: '1 / -1' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '15px', fontWeight: '600' }}>Type Summary</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  {['Resource Type', 'Count', 'Percentage', 'Status'].map(h => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontWeight: '600', color: '#374151', fontSize: '13px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {typeChartData.map((row, i) => (
                  <tr key={i} style={{ borderTop: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '12px 16px', fontWeight: '500' }}>
                      <span style={{
                        display: 'inline-block', width: '10px', height: '10px',
                        borderRadius: '50%', background: Object.values(TYPE_COLORS)[i % 4],
                        marginRight: '8px',
                      }} />
                      {row.name}
                    </td>
                    <td style={{ padding: '12px 16px', color: '#374151' }}>{row.value}</td>
                    <td style={{ padding: '12px 16px', color: '#6b7280' }}>
                      {analytics.totalResources > 0
                        ? `${((row.value / Number(analytics.totalResources)) * 100).toFixed(1)}%`
                        : '0%'}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ width: '100px', background: '#f0f0f0', borderRadius: '4px', height: '6px' }}>
                        <div style={{
                          width: analytics.totalResources > 0
                            ? `${(row.value / Number(analytics.totalResources)) * 100}%`
                            : '0%',
                          background: Object.values(TYPE_COLORS)[i % 4],
                          borderRadius: '4px', height: '100%',
                        }} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create modal */}
      {showForm && (
        <Modal title="Add New Resource" onClose={() => setShowForm(false)}>
          <ResourceForm loading={loading} onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
        </Modal>
      )}

      {/* Edit modal */}
      {editTarget && (
        <Modal title="Edit Resource" onClose={() => setEditTarget(null)}>
          <ResourceForm initial={editTarget} loading={loading}
            onSubmit={handleEdit} onCancel={() => setEditTarget(null)} />
        </Modal>
      )}
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
      zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
      backdropFilter: 'blur(2px)',
    }}>
      <div style={{
        background: '#fff', borderRadius: '16px', padding: '28px',
        width: '620px', maxHeight: '90vh', overflowY: 'auto',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>{title}</h2>
          <button onClick={onClose} style={{
            background: '#f3f4f6', border: 'none', borderRadius: '8px',
            width: '32px', height: '32px', cursor: 'pointer',
            fontSize: '16px', color: '#6b7280', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
          }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function ActionBtn({ onClick, color, children }) {
  return (
    <button onClick={onClick} style={{
      padding: '5px 10px', borderRadius: '6px',
      border: `1px solid ${color}30`, color: color,
      background: `${color}08`, cursor: 'pointer',
      fontSize: '12px', fontWeight: '500',
      transition: 'background 0.1s',
    }}
      onMouseEnter={e => e.currentTarget.style.background = `${color}15`}
      onMouseLeave={e => e.currentTarget.style.background = `${color}08`}
    >
      {children}
    </button>
  );
}
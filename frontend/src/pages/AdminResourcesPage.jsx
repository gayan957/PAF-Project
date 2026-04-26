import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  BarChart3,
  Building2,
  CheckCircle2,
  Edit3,
  Eye,
  Plus,
  Search,
  Trash2,
  Wrench,
  X,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  createResource,
  deleteResource,
  getAnalytics,
  getResources,
  updateResource,
} from '../api/resourceApi';
import ResourceForm from '../components/resources/ResourceForm';
import StatusBadge from '../components/resources/StatusBadge';
import { getPrimaryResourceImage } from '../components/resources/resourceImages';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const TYPE_COLORS = {
  LAB: '#0284c7',
  LECTURE_HALL: '#7c3aed',
  MEETING_ROOM: '#0f766e',
  EQUIPMENT: '#c2410c',
};

const STATUS_COLORS = {
  Active: '#16a34a',
  'Under Maintenance': '#d97706',
  'Out of Service': '#dc2626',
};

const STATUS_LABELS = {
  ACTIVE: 'Active',
  UNDER_MAINTENANCE: 'Under Maintenance',
  OUT_OF_SERVICE: 'Out of Service',
};

export default function AdminResourcesPage() {
  const navigate = useNavigate();
  const [resources, setResources] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [activeTab, setActiveTab] = useState('inventory');

  const fetchAll = async () => {
    setPageLoading(true);
    try {
      const [resourceResponse, analyticsResponse] = await Promise.all([
        getResources({ size: 100, sort: 'name' }),
        getAnalytics(),
      ]);
      setResources(resourceResponse.data.data.content || []);
      setAnalytics(analyticsResponse.data.data);
    } catch (error) {
      console.error('Failed to load facilities', error);
      window.alert('Could not load facilities: ' + (error.response?.data?.message || error.message));
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleCreate = async (data, imageFiles = []) => {
    setLoading(true);
    try {
      await createResource(data, imageFiles);
      setShowForm(false);
      await fetchAll();
    } catch (error) {
      window.alert('Error: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (data, imageFiles = []) => {
    setLoading(true);
    try {
      await updateResource(editTarget.id, data, imageFiles);
      setEditTarget(null);
      await fetchAll();
    } catch (error) {
      window.alert('Error: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (resource) => {
    if (!window.confirm(`Remove "${resource.name}" from Facilities Management?`)) return;
    try {
      await deleteResource(resource.id);
      await fetchAll();
    } catch (error) {
      window.alert('Delete failed: ' + (error.response?.data?.message || error.message));
    }
  };

  const filteredResources = useMemo(() => {
    const query = search.trim().toLowerCase();
    return resources.filter((resource) => {
      const matchesSearch = !query
        || resource.name?.toLowerCase().includes(query)
        || resource.location?.toLowerCase().includes(query)
        || resource.building?.toLowerCase().includes(query)
        || resource.type?.toLowerCase().includes(query);
      const matchesStatus = !statusFilter || resource.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [resources, search, statusFilter]);

  const typeChartData = analytics?.countByType
    ? Object.entries(analytics.countByType).map(([name, value]) => ({
        name: formatEnum(name),
        value: Number(value),
        rawName: name,
      }))
    : [];

  const statusChartData = analytics
    ? [
        { name: 'Active', value: Number(analytics.activeCount) },
        { name: 'Under Maintenance', value: Number(analytics.underMaintenanceCount) },
        { name: 'Out of Service', value: Number(analytics.outOfServiceCount) },
      ].filter((item) => item.value > 0)
    : [];

  const buildingChartData = analytics?.countByBuilding
    ? Object.entries(analytics.countByBuilding)
        .map(([name, value]) => ({ name, value: Number(value) }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 8)
    : [];

  const operationalScore = analytics?.totalResources
    ? Math.round((Number(analytics.activeCount) / Number(analytics.totalResources)) * 100)
    : 0;

  const attentionList = resources
    .filter((resource) => resource.status !== 'ACTIVE')
    .slice(0, 4);

  return (
    <div style={{ padding: '24px', maxWidth: '1340px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '20px', marginBottom: '24px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '850', color: '#0f172a', letterSpacing: '0' }}>
            Facilities Management
          </h1>
          <p style={{ margin: '6px 0 0', color: '#64748b', fontSize: '14px' }}>
            Manage campus facilities, equipment records, operational status, and asset visibility.
          </p>
        </div>

        <button type="button" onClick={() => setShowForm(true)} style={primaryButton}>
          <Plus size={18} />
          Add Facility
        </button>
      </div>

      {analytics && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: '14px', marginBottom: '22px' }}>
          <Metric title="Total Facilities" value={analytics.totalResources} color="#0284c7" icon={Building2} />
          <Metric title="Active" value={analytics.activeCount} color="#16a34a" icon={CheckCircle2} />
          <Metric title="Maintenance" value={analytics.underMaintenanceCount} color="#d97706" icon={Wrench} />
          <Metric title="Out of Service" value={analytics.outOfServiceCount} color="#dc2626" icon={X} />
          <Metric title="Health Score" value={`${operationalScore}%`} color="#0f766e" icon={Activity} />
        </div>
      )}

      <div style={{ display: 'flex', gap: '4px', marginBottom: '18px', background: '#f1f5f9', borderRadius: '8px', padding: '4px', width: 'fit-content', border: '1px solid #e2e8f0' }}>
        <TabButton active={activeTab === 'inventory'} onClick={() => setActiveTab('inventory')} icon={Building2}>
          Inventory
        </TabButton>
        <TabButton active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} icon={BarChart3}>
          Analytics
        </TabButton>
      </div>

      {activeTab === 'inventory' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 220px', gap: '12px', marginBottom: '16px' }}>
            <div style={{ position: 'relative' }}>
              <Search size={17} style={{ position: 'absolute', left: '13px', top: '12px', color: '#64748b' }} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by facility, building, location, or type"
                style={{ ...inputStyle, paddingLeft: '40px' }}
              />
            </div>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} style={inputStyle}>
              <option value="">All statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="UNDER_MAINTENANCE">Under Maintenance</option>
              <option value="OUT_OF_SERVICE">Out of Service</option>
            </select>
          </div>

          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  {['Facility', 'Type', 'Location', 'Capacity', 'Hours', 'Status', 'Actions'].map((heading) => (
                    <th key={heading} style={tableHeader}>{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pageLoading ? (
                  <tr>
                    <td colSpan={7} style={emptyCell}>Loading facilities...</td>
                  </tr>
                ) : filteredResources.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={emptyCell}>No facilities found.</td>
                  </tr>
                ) : filteredResources.map((resource) => {
                  const primaryImage = getPrimaryResourceImage(resource);

                  return (
                  <tr key={resource.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={tableCell}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {primaryImage ? (
                          <img
                            src={primaryImage}
                            alt={resource.name}
                            style={{ width: '44px', height: '44px', borderRadius: '8px', objectFit: 'cover', border: '1px solid #e2e8f0', flexShrink: 0 }}
                          />
                        ) : (
                          <div style={{
                            width: '44px',
                            height: '44px',
                            borderRadius: '8px',
                            background: '#ecfeff',
                            color: '#0f766e',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}>
                            <Building2 size={20} />
                          </div>
                        )}
                        <div>
                          <div style={{ fontWeight: '800', color: '#0f172a' }}>{resource.name}</div>
                          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '3px' }}>{resource.building || 'No building assigned'}</div>
                        </div>
                      </div>
                    </td>
                    <td style={tableCell}>
                      <span style={{
                        fontSize: '12px',
                        padding: '5px 9px',
                        borderRadius: '999px',
                        background: `${TYPE_COLORS[resource.type] || '#64748b'}14`,
                        color: TYPE_COLORS[resource.type] || '#64748b',
                        fontWeight: '800',
                        whiteSpace: 'nowrap',
                      }}>
                        {formatEnum(resource.type)}
                      </span>
                    </td>
                    <td style={{ ...tableCell, color: '#475569' }}>{resource.location}</td>
                    <td style={{ ...tableCell, color: '#475569' }}>{resource.capacity || 'N/A'}</td>
                    <td style={{ ...tableCell, color: '#475569' }}>{resource.availabilityStart} to {resource.availabilityEnd}</td>
                    <td style={tableCell}><StatusBadge status={resource.status} /></td>
                    <td style={tableCell}>
                      <div style={{ display: 'flex', gap: '7px' }}>
                        <IconButton title="View" color="#475569" onClick={() => navigate(`/resources/${resource.id}`)} icon={Eye} />
                        <IconButton title="Edit" color="#0f766e" onClick={() => setEditTarget(resource)} icon={Edit3} />
                        <IconButton title="Remove" color="#dc2626" onClick={() => handleDelete(resource)} icon={Trash2} />
                      </div>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {activeTab === 'analytics' && analytics && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
          <ChartPanel title="Facilities by Type">
            {typeChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={270}>
                <PieChart>
                  <Pie data={typeChartData} cx="50%" cy="50%" outerRadius={92} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                    {typeChartData.map((entry, index) => (
                      <Cell key={entry.rawName} fill={TYPE_COLORS[entry.rawName] || Object.values(TYPE_COLORS)[index % 4]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : <EmptyChart />}
          </ChartPanel>

          <ChartPanel title="Operational Status">
            {statusChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={270}>
                <PieChart>
                  <Pie data={statusChartData} cx="50%" cy="50%" innerRadius={54} outerRadius={92} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                    {statusChartData.map((entry) => (
                      <Cell key={entry.name} fill={STATUS_COLORS[entry.name]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : <EmptyChart />}
          </ChartPanel>

          <ChartPanel title="Top Buildings by Facility Count" wide>
            {buildingChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={buildingChartData} margin={{ top: 8, right: 20, left: 0, bottom: 6 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#0f766e" radius={[6, 6, 0, 0]} name="Facilities" />
                </BarChart>
              </ResponsiveContainer>
            ) : <EmptyChart />}
          </ChartPanel>

          <ChartPanel title="Facilities Requiring Attention" wide>
            {attentionList.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '12px' }}>
                {attentionList.map((resource) => (
                  <div key={resource.id} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontWeight: '800', color: '#0f172a' }}>{resource.name}</div>
                        <div style={{ fontSize: '12px', color: '#64748b', marginTop: '3px' }}>{resource.location}</div>
                      </div>
                      <StatusBadge status={resource.status} />
                    </div>
                    <p style={{ margin: '10px 0 0', color: '#64748b', fontSize: '13px' }}>
                      {resource.statusReason || `Marked as ${STATUS_LABELS[resource.status]}. Review operational readiness.`}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '28px', textAlign: 'center', color: '#16a34a', fontWeight: '800' }}>
                All facilities are currently active.
              </div>
            )}
          </ChartPanel>
        </div>
      )}

      {showForm && (
        <Modal title="Add Facility" onClose={() => setShowForm(false)}>
          <ResourceForm loading={loading} onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
        </Modal>
      )}

      {editTarget && (
        <Modal title={`Edit ${editTarget.name}`} onClose={() => setEditTarget(null)}>
          <ResourceForm
            initial={editTarget}
            loading={loading}
            onSubmit={handleEdit}
            onCancel={() => setEditTarget(null)}
          />
        </Modal>
      )}
    </div>
  );
}

function Metric({ title, value, color, icon: Icon }) {
  return (
    <div style={{
      background: '#fff',
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      padding: '16px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      minHeight: '76px',
    }}>
      <div style={{
        width: '42px',
        height: '42px',
        borderRadius: '8px',
        background: `${color}14`,
        color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Icon size={22} />
      </div>
      <div>
        <div style={{ fontSize: '22px', fontWeight: '850', color: '#0f172a', lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: '12px', color: '#64748b', marginTop: '5px', fontWeight: '700' }}>{title}</div>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon: Icon, children }) {
  return (
    <button type="button" onClick={onClick} style={{
      padding: '8px 16px',
      borderRadius: '7px',
      border: 'none',
      background: active ? '#fff' : 'transparent',
      color: active ? '#0f172a' : '#64748b',
      fontWeight: '800',
      cursor: 'pointer',
      fontSize: '14px',
      boxShadow: active ? '0 1px 4px rgba(15, 23, 42, 0.12)' : 'none',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
    }}>
      <Icon size={16} />
      {children}
    </button>
  );
}

function ChartPanel({ title, children, wide }) {
  return (
    <div style={{
      background: '#fff',
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      padding: '18px',
      gridColumn: wide ? '1 / -1' : 'auto',
    }}>
      <h3 style={{ margin: '0 0 14px', fontSize: '15px', fontWeight: '850', color: '#0f172a' }}>{title}</h3>
      {children}
    </div>
  );
}

function EmptyChart() {
  return (
    <div style={{ height: '210px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontWeight: '700' }}>
      No data yet
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(15, 23, 42, 0.54)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      backdropFilter: 'blur(2px)',
    }}>
      <div style={{
        background: '#fff',
        borderRadius: '10px',
        padding: '24px',
        width: '640px',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 24px 70px rgba(15, 23, 42, 0.24)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '850', color: '#0f172a' }}>{title}</h2>
          <button type="button" onClick={onClose} title="Close" style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            width: '34px',
            height: '34px',
            cursor: 'pointer',
            color: '#475569',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function IconButton({ title, color, onClick, icon: Icon }) {
  return (
    <button type="button" title={title} onClick={onClick} style={{
      width: '34px',
      height: '32px',
      borderRadius: '8px',
      border: `1px solid ${color}24`,
      color,
      background: `${color}0d`,
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <Icon size={16} />
    </button>
  );
}

function formatEnum(value) {
  return value?.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase()) || 'N/A';
}

const primaryButton = {
  padding: '10px 16px',
  borderRadius: '8px',
  border: 'none',
  background: '#0f766e',
  color: '#fff',
  fontWeight: '850',
  cursor: 'pointer',
  fontSize: '14px',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  boxShadow: '0 8px 18px rgba(15, 118, 110, 0.22)',
};

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  border: '1px solid #d7dde8',
  borderRadius: '8px',
  fontSize: '14px',
  outline: 'none',
  boxSizing: 'border-box',
  background: '#fff',
};

const tableHeader = {
  padding: '12px 16px',
  textAlign: 'left',
  fontWeight: '850',
  color: '#334155',
  fontSize: '12px',
  textTransform: 'uppercase',
  letterSpacing: '0',
};

const tableCell = {
  padding: '14px 16px',
  verticalAlign: 'middle',
};

const emptyCell = {
  padding: '42px',
  textAlign: 'center',
  color: '#94a3b8',
  fontWeight: '700',
};

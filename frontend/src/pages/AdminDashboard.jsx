import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import {
  AlertTriangle, CalendarDays, Home, TicketIcon, Trash2, UserPlus,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import TicketList from '../components/tickets/TicketList';
import AssignModal from '../components/tickets/AssignModal';
import { getAllBookings, getBookingStats } from '../api/bookingApi';
import './AdminDashboard.css';

// ── colour tokens ─────────────────────────────────────────────────────────────
const TICKET_COLORS = {
  OPEN:        { fill: '#f59e0b', bg: '#fef3c7', text: '#92400e', label: 'Open' },
  IN_PROGRESS: { fill: '#3b82f6', bg: '#dbeafe', text: '#1e40af', label: 'In Progress' },
  RESOLVED:    { fill: '#10b981', bg: '#d1fae5', text: '#065f46', label: 'Resolved' },
  CLOSED:      { fill: '#94a3b8', bg: '#f1f5f9', text: '#475569', label: 'Closed' },
};

const BOOKING_COLORS = {
  PENDING:   { fill: '#f59e0b', label: 'Pending' },
  APPROVED:  { fill: '#10b981', label: 'Approved' },
  REJECTED:  { fill: '#ef4444', label: 'Rejected' },
  CANCELLED: { fill: '#94a3b8', label: 'Cancelled' },
};

// ── custom tooltip ─────────────────────────────────────────────────────────────
const ChartTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px',
      padding: '8px 12px', fontSize: '13px', color: '#0f172a', fontWeight: '700',
      boxShadow: '0 4px 12px rgba(15,23,42,0.08)',
    }}>
      <span style={{ color: payload[0].fill || payload[0].color }}>● </span>
      {payload[0].name}: <strong>{payload[0].value}</strong>
    </div>
  );
};

// ── legend row shared by both donut charts ─────────────────────────────────────
function LegendRow({ color, label, value, total }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '5px 0', borderBottom: '1px solid #f1f5f9' }}>
      <span style={{ width: 10, height: 10, borderRadius: '50%', background: color, flexShrink: 0, display: 'inline-block' }} />
      <span style={{ flex: 1, fontSize: '13px', color: '#475569' }}>{label}</span>
      <span style={{ fontSize: '13px', fontWeight: '800', color: '#0f172a' }}>{value}</span>
      <span style={{ fontSize: '12px', color: '#94a3b8', width: '36px', textAlign: 'right' }}>{pct}%</span>
    </div>
  );
}

// ── donut centre label (overlay div, not SVG) ─────────────────────────────────
function DonutCenter({ total, label }) {
  return (
    <div style={{
      position: 'absolute', top: '50%', left: '50%',
      transform: 'translate(-50%, -50%)',
      textAlign: 'center', pointerEvents: 'none',
    }}>
      <div style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a', lineHeight: 1 }}>{total}</div>
      <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '3px' }}>{label}</div>
    </div>
  );
}

// ── main component ─────────────────────────────────────────────────────────────
const AdminDashboard = () => {
  const [users, setUsers]             = useState([]);
  const [tickets, setTickets]         = useState([]);
  const [bookingStats, setBookingStats] = useState(null);
  const [topResources, setTopResources] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);

  const fetchData = async () => {
    try {
      const [usersRes, ticketsRes, statsRes, bookingsRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/tickets'),
        getBookingStats(),
        getAllBookings({ size: 500 }),
      ]);

      const usersData   = Array.isArray(usersRes.data) ? usersRes.data : [];
      const ticketsData = Array.isArray(ticketsRes.data) ? ticketsRes.data : [];
      const stats       = statsRes.data?.data ?? statsRes.data ?? {};
      const allBookings = bookingsRes.data?.data?.content ?? [];

      // compute bookings per resource (top 8)
      const resourceMap = {};
      allBookings.forEach((b) => {
        const name = b.resourceName || 'Unknown';
        resourceMap[name] = (resourceMap[name] || 0) + 1;
      });
      const sorted = Object.entries(resourceMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([name, count]) => ({ name, count }));

      setUsers(usersData);
      setTickets(ticketsData);
      setBookingStats(stats);
      setTopResources(sorted);
    } catch (err) {
      console.error('AdminDashboard fetch error', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleDeleteTicket = async (ticketId) => {
    if (!window.confirm('Delete this ticket?')) return;
    try {
      await api.delete(`/tickets/${ticketId}`);
      fetchData();
    } catch (err) {
      console.error('Failed to delete ticket', err);
    }
  };

  if (loading) return <div className="loader" />;

  const technicians = users.filter(
    (u) => u.role === 'ROLE_TECHNICIAN' || u.role === 'TECHNICIAN',
  );

  // ── derived ticket data ──────────────────────────────────────────────────────
  const ticketStatusCounts = { OPEN: 0, IN_PROGRESS: 0, RESOLVED: 0, CLOSED: 0 };
  tickets.forEach((t) => {
    if (ticketStatusCounts[t.status] !== undefined) ticketStatusCounts[t.status]++;
  });
  const ticketPieData = Object.entries(TICKET_COLORS).map(([key, meta]) => ({
    name: meta.label, value: ticketStatusCounts[key], fill: meta.fill,
  }));
  const urgentOpen = tickets.filter(
    (t) => t.priority === 'URGENT' && t.status !== 'RESOLVED' && t.status !== 'CLOSED',
  ).length;

  // ── derived booking data ─────────────────────────────────────────────────────
  const bs = bookingStats || {};
  const bookingPieData = Object.entries(BOOKING_COLORS).map(([key, meta]) => ({
    name: meta.label,
    value: Number(bs[key.toLowerCase()] ?? 0),
    fill: meta.fill,
  }));
  const totalBookings = Number(bs.total ?? 0);

  const renderAdminActions = (ticket) => (
    <>
      <button onClick={() => setSelectedTicket(ticket)} className="btn btn-primary btn-sm">
        <UserPlus size={14} style={{ marginRight: '4px' }} />
        Assign
      </button>
      <button
        onClick={() => handleDeleteTicket(ticket.id)}
        className="btn btn-outline btn-sm"
        style={{ color: 'var(--danger)' }}
      >
        <Trash2 size={14} />
      </button>
    </>
  );

  return (
    <div className="admin-dashboard-container page-container">
      {/* Header */}
      <div className="admin-page-header">
        <div className="admin-page-title">
          <span className="admin-page-title-icon"><Home size={20} /></span>
          Dashboard
        </div>
        <div className="admin-breadcrumb">Overview</div>
      </div>

      {/* ── Summary cards ──────────────────────────────────────────────────── */}
      <div className="admin-cards-row">
        {/* Tickets */}
        <div className="admin-gradient-card bg-gradient-danger">
          <div className="admin-card-inner">
            <div>
              <div className="admin-card-title">Total Tickets</div>
              <div className="admin-card-value">{tickets.length}</div>
            </div>
            <TicketIcon size={28} className="admin-card-icon" />
          </div>
          <div className="admin-card-subtitle">
            {ticketStatusCounts.OPEN} open · {ticketStatusCounts.IN_PROGRESS} in progress
          </div>
          <div className="admin-card-decor" />
          <div className="admin-card-decor-2" />
        </div>

        {/* Bookings */}
        <div className="admin-gradient-card bg-gradient-info">
          <div className="admin-card-inner">
            <div>
              <div className="admin-card-title">Total Bookings</div>
              <div className="admin-card-value">{totalBookings}</div>
            </div>
            <CalendarDays size={28} className="admin-card-icon" />
          </div>
          <div className="admin-card-subtitle">
            {Number(bs.pending ?? 0)} pending approval · {Number(bs.approved ?? 0)} approved
          </div>
          <div className="admin-card-decor" />
          <div className="admin-card-decor-2" />
        </div>

        {/* Urgent alerts */}
        <div className="admin-gradient-card bg-gradient-success">
          <div className="admin-card-inner">
            <div>
              <div className="admin-card-title">Urgent Alerts</div>
              <div className="admin-card-value">{urgentOpen}</div>
            </div>
            <AlertTriangle size={28} className="admin-card-icon" />
          </div>
          <div className="admin-card-subtitle">
            {ticketStatusCounts.RESOLVED + ticketStatusCounts.CLOSED} tickets closed · {users.length} users
          </div>
          <div className="admin-card-decor" />
          <div className="admin-card-decor-2" />
        </div>
      </div>

      {/* ── Donut charts row ───────────────────────────────────────────────── */}
      <div className="admin-charts-row">
        {/* Ticket status donut */}
        <div className="admin-chart-card">
          <div className="admin-chart-title">Ticket Status Distribution</div>
          <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
            <div style={{ flex: '0 0 220px', height: 220, position: 'relative' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={ticketPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={68}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                    startAngle={90}
                    endAngle={-270}
                  >
                    {ticketPieData.map((entry) => (
                      <Cell key={entry.name} fill={entry.fill} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <DonutCenter total={tickets.length} label="tickets" />
            </div>
            <div style={{ flex: 1 }}>
              {Object.entries(TICKET_COLORS).map(([key, meta]) => (
                <LegendRow
                  key={key}
                  color={meta.fill}
                  label={meta.label}
                  value={ticketStatusCounts[key]}
                  total={tickets.length}
                />
              ))}
            </div>
          </div>

          {/* Priority quick-stats */}
          <div style={{ display: 'flex', gap: '8px', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
            {['URGENT', 'HIGH', 'MEDIUM', 'LOW'].map((p) => {
              const count = tickets.filter((t) => t.priority === p).length;
              const colors = { URGENT: '#ef4444', HIGH: '#f97316', MEDIUM: '#f59e0b', LOW: '#64748b' };
              return (
                <div key={p} style={{
                  flex: 1, textAlign: 'center', padding: '8px 4px',
                  background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0',
                }}>
                  <div style={{ fontSize: '18px', fontWeight: '800', color: colors[p] }}>{count}</div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', marginTop: '2px' }}>{p}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Booking status donut */}
        <div className="admin-chart-card">
          <div className="admin-chart-title">Booking Status</div>
          <div style={{ height: 220, position: 'relative' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={bookingPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={68}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                  startAngle={90}
                  endAngle={-270}
                >
                  {bookingPieData.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} stroke="none" />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <DonutCenter total={totalBookings} label="bookings" />
          </div>
          <div style={{ marginTop: '12px' }}>
            {bookingPieData.map((entry) => (
              <LegendRow
                key={entry.name}
                color={entry.fill}
                label={entry.name}
                value={entry.value}
                total={totalBookings}
              />
            ))}
          </div>

          {/* Today / upcoming quick stats */}
          <div style={{ display: 'flex', gap: '8px', marginTop: '16px', paddingTop: '14px', borderTop: '1px solid #f1f5f9' }}>
            <div style={{ flex: 1, textAlign: 'center', padding: '8px', background: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
              <div style={{ fontSize: '18px', fontWeight: '800', color: '#15803d' }}>{Number(bs.todayApproved ?? 0)}</div>
              <div style={{ fontSize: '11px', color: '#15803d', fontWeight: '700', marginTop: '2px' }}>Today</div>
            </div>
            <div style={{ flex: 1, textAlign: 'center', padding: '8px', background: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
              <div style={{ fontSize: '18px', fontWeight: '800', color: '#1d4ed8' }}>{Number(bs.upcomingApproved ?? 0)}</div>
              <div style={{ fontSize: '11px', color: '#1d4ed8', fontWeight: '700', marginTop: '2px' }}>Upcoming</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bookings by resource bar chart ────────────────────────────────── */}
      {topResources.length > 0 && (
        <div className="admin-chart-card" style={{ marginBottom: '2rem' }}>
          <div className="admin-chart-title">
            Bookings by Resource
            <span style={{ fontSize: '12px', fontWeight: '400', color: 'var(--text-muted)' }}>
              top {topResources.length} most-booked facilities
            </span>
          </div>
          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer>
              <BarChart
                data={topResources}
                layout="vertical"
                margin={{ top: 0, right: 24, left: 8, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis
                  type="number"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  allowDecimals={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={160}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#475569', fontSize: 12, fontWeight: 700 }}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(15,118,110,0.05)' }}
                  content={<ChartTooltip />}
                />
                <Bar dataKey="count" name="Bookings" fill="#0f766e" radius={[0, 6, 6, 0]} barSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ── Ticket list ────────────────────────────────────────────────────── */}
      <div style={{
        background: '#fff', padding: '24px', borderRadius: '12px',
        border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(15,23,42,0.06)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <p style={{ margin: '0 0 2px', fontSize: '12px', fontWeight: '800', color: '#0f766e', textTransform: 'uppercase' }}>
              Support Queue
            </p>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>
              Ticket Management
            </h2>
          </div>
          <span style={{
            padding: '4px 12px', borderRadius: '999px',
            background: '#f1f5f9', fontSize: '13px', fontWeight: '800', color: '#475569',
          }}>
            {tickets.length} total
          </span>
        </div>
        <TicketList tickets={tickets} renderActions={renderAdminActions} />
      </div>

      {selectedTicket && (
        <AssignModal
          ticket={selectedTicket}
          technicians={technicians}
          onSuccess={fetchData}
          onClose={() => setSelectedTicket(null)}
        />
      )}
    </div>
  );
};

export default AdminDashboard;

import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { Users, Activity, Trash2, Ticket as TicketIcon, UserPlus } from 'lucide-react';
import TicketList from '../components/tickets/TicketList';
import AssignModal from '../components/tickets/AssignModal';

const AdminDashboard = () => {
    const [stats, setStats] = useState({ users: 0, tickets: 0, alerts: 0 });
    const [users, setUsers] = useState([]);
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState(null);

    const fetchData = async () => {
        try {
            const [usersRes, ticketsRes] = await Promise.all([
                api.get('/admin/users'),
                api.get('/tickets')
            ]);
            
            const usersData = Array.isArray(usersRes.data) ? usersRes.data : [];
            const ticketsData = Array.isArray(ticketsRes.data) ? ticketsRes.data : [];
            
            setUsers(usersData);
            setTickets(ticketsData);
            setStats({
                users: usersData.length,
                tickets: ticketsData.length,
                alerts: ticketsData.filter(t => t.priority === 'URGENT' && t.status !== 'RESOLVED').length
            });
        } catch (error) {
            console.error("Error fetching admin data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleRoleChange = async (userId, newRole) => {
        try {
            setActionLoading(true);
            const response = await api.put(`/admin/users/${userId}/role`, { role: newRole });
            setUsers(users.map(user => user.id === userId ? response.data : user));
        } catch (error) {
            console.error("Failed to update user role", error);
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;
        try {
            setActionLoading(true);
            await api.delete(`/admin/users/${userId}`);
            setUsers(users.filter(user => user.id !== userId));
        } catch (error) {
            console.error("Failed to delete user", error);
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteTicket = async (ticketId) => {
        if (!window.confirm("Delete this ticket?")) return;
        try {
            await api.delete(`/tickets/${ticketId}`);
            fetchData();
        } catch (error) {
            console.error("Failed to delete ticket", error);
        }
    };

    if (loading) return <div className="loader"></div>;

    const technicians = users.filter(u => u.role === 'ROLE_TECHNICIAN' || u.role === 'TECHNICIAN');

    const renderAdminActions = (ticket) => (
        <>
            <button onClick={() => setSelectedTicket(ticket)} className="btn btn-primary btn-sm">
                <UserPlus size={14} style={{ marginRight: '4px' }} />
                Assign
            </button>
            <button onClick={() => handleDeleteTicket(ticket.id)} className="btn btn-outline btn-sm" style={{ color: 'var(--danger)' }}>
                <Trash2 size={14} />
            </button>
        </>
    );

    return (
        <div className="page-container">
            <div className="container">
                <div className="dashboard-header">
                    <h1 className="dashboard-title">Admin Dashboard</h1>
                </div>

                <div className="dashboard-grid">
                    <div className="glass-panel stat-card">
                        <div className="stat-icon" style={{ color: 'var(--accent)', background: 'rgba(139, 92, 246, 0.1)' }}>
                            <Users size={24} />
                        </div>
                        <div className="stat-content">
                            <h3>Total Users</h3>
                            <p>{stats.users}</p>
                        </div>
                    </div>
                    <div className="glass-panel stat-card">
                        <div className="stat-icon" style={{ color: 'var(--primary)', background: 'rgba(59, 130, 246, 0.1)' }}>
                            <TicketIcon size={24} />
                        </div>
                        <div className="stat-content">
                            <h3>Total Tickets</h3>
                            <p>{stats.tickets}</p>
                        </div>
                    </div>
                    <div className="glass-panel stat-card">
                        <div className="stat-icon" style={{ color: 'var(--danger)', background: 'rgba(239, 68, 68, 0.1)' }}>
                            <Activity size={24} />
                        </div>
                        <div className="stat-content">
                            <h3>Urgent Tickets</h3>
                            <p>{stats.alerts}</p>
                        </div>
                    </div>
                </div>

                <div className="glass-panel content-card" style={{ marginTop: '2rem' }}>
                    <h2 style={{ border: 'none' }}>Ticket Management</h2>
                    <TicketList 
                        tickets={tickets} 
                        renderActions={renderAdminActions} 
                    />
                </div>

                <div className="glass-panel content-card" style={{ marginTop: '2rem' }}>
                    <h2 style={{ border: 'none' }}>User Management</h2>
                    <div style={{ overflowX: 'auto', marginTop: '1rem' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                    <th style={{ padding: '0.75rem 1rem' }}>Name</th>
                                    <th style={{ padding: '0.75rem 1rem' }}>Email</th>
                                    <th style={{ padding: '0.75rem 1rem' }}>Role</th>
                                    <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody style={{ opacity: actionLoading ? 0.5 : 1 }}>
                                {users.map(user => (
                                    <tr key={user.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <td style={{ padding: '0.75rem 1rem' }}>{user.name}</td>
                                        <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>{user.email}</td>
                                        <td style={{ padding: '0.75rem 1rem' }}>
                                            <select 
                                                value={user.role} 
                                                onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                                disabled={actionLoading}
                                                style={{
                                                    background: 'rgba(30, 41, 59, 0.8)',
                                                    color: 'var(--text-main)',
                                                    border: '1px solid var(--border)',
                                                    padding: '0.4rem',
                                                    borderRadius: '0.25rem',
                                                    outline: 'none',
                                                    fontFamily: 'inherit'
                                                }}
                                            >
                                                <option value="ROLE_USER">User</option>
                                                <option value="ROLE_TECHNICIAN">Technician</option>
                                                <option value="ROLE_ADMIN">Admin</option>
                                            </select>
                                        </td>
                                        <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                                            <button 
                                                onClick={() => handleDeleteUser(user.id)}
                                                disabled={actionLoading}
                                                className="btn btn-outline"
                                                style={{ padding: '0.4rem', color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
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

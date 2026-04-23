import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { Users, Server, Activity, Trash2 } from 'lucide-react';

const AdminDashboard = () => {
    const [data, setData] = useState(null);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [dashboardRes, usersRes] = await Promise.all([
                    api.get('/dashboard/admin'),
                    api.get('/admin/users')
                ]);
                setData(dashboardRes.data);
                setUsers(usersRes.data);
            } catch (error) {
                console.error("Error fetching admin data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleRoleChange = async (userId, newRole) => {
        try {
            setActionLoading(true);
            const response = await api.put(`/admin/users/${userId}/role`, { role: newRole });
            setUsers(users.map(user => user.id === userId ? response.data : user));
        } catch (error) {
            console.error("Failed to update user role", error);
            alert("Failed to update user role.");
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
            alert("Failed to delete user.");
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) return <div className="loader"></div>;

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
                            <p>{users.length}</p>
                        </div>
                    </div>
                    <div className="glass-panel stat-card">
                        <div className="stat-icon" style={{ color: 'var(--success)', background: 'rgba(16, 185, 129, 0.1)' }}>
                            <Server size={24} />
                        </div>
                        <div className="stat-content">
                            <h3>System Status</h3>
                            <p>Online</p>
                        </div>
                    </div>
                    <div className="glass-panel stat-card">
                        <div className="stat-icon" style={{ color: 'var(--danger)', background: 'rgba(239, 68, 68, 0.1)' }}>
                            <Activity size={24} />
                        </div>
                        <div className="stat-content">
                            <h3>Active Alerts</h3>
                            <p>0</p>
                        </div>
                    </div>
                </div>

                <div className="glass-panel content-card">
                    <h2>Server Message</h2>
                    <div className="message-box">
                        {data || "No data received from server."}
                    </div>
                </div>

                <div className="glass-panel content-card">
                    <h2>User Management</h2>
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
                                                title="Delete User"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {users.length === 0 && (
                                    <tr>
                                        <td colSpan="4" style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>No users found</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;

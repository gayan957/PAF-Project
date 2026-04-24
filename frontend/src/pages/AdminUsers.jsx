import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { Trash2, Users } from 'lucide-react';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    const fetchUsers = async () => {
        try {
            const usersRes = await api.get('/admin/users');
            setUsers(Array.isArray(usersRes.data) ? usersRes.data : []);
        } catch (error) {
            console.error("Error fetching users", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
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

    if (loading) return <div className="loader"></div>;

    return (
        <div className="page-container">
            <div className="admin-page-header">
                <div className="admin-page-title">
                    <span className="admin-page-title-icon"><Users size={20} /></span>
                    User Management
                </div>
            </div>

            <div className="glass-panel content-card" style={{ marginTop: '1rem', background: 'rgba(14, 165, 233, 0.1)', borderColor: 'rgba(14, 165, 233, 0.2)', padding: '1.5rem' }}>
                <h2 style={{ border: 'none', color: '#f8fafc', marginBottom: '1.5rem' }}>
                    System Users <span style={{fontSize: '0.85rem', color: '#94a3b8', fontWeight: 'normal', marginLeft: '10px'}}>(Total: {users.length})</span>
                </h2>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid rgba(14, 165, 233, 0.2)' }}>
                                <th style={{ padding: '1rem', color: '#bae6fd', fontWeight: '600' }}>Name</th>
                                <th style={{ padding: '1rem', color: '#bae6fd', fontWeight: '600' }}>Email</th>
                                <th style={{ padding: '1rem', color: '#bae6fd', fontWeight: '600' }}>Role</th>
                                <th style={{ padding: '1rem', textAlign: 'right', color: '#bae6fd', fontWeight: '600' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody style={{ opacity: actionLoading ? 0.5 : 1 }}>
                            {users.map(user => (
                                <tr key={user.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '1rem', color: '#f8fafc', fontWeight: '500' }}>{user.name}</td>
                                    <td style={{ padding: '1rem', color: '#cbd5e1' }}>{user.email}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <select 
                                            value={user.role} 
                                            onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                            disabled={actionLoading}
                                            style={{
                                                background: 'rgba(15, 23, 42, 0.6)',
                                                color: '#f8fafc',
                                                border: '1px solid rgba(14, 165, 233, 0.3)',
                                                padding: '0.5rem 0.75rem',
                                                borderRadius: '0.375rem',
                                                outline: 'none',
                                                fontFamily: 'inherit',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            <option value="ROLE_USER">User</option>
                                            <option value="ROLE_TECHNICIAN">Technician</option>
                                            <option value="ROLE_ADMIN">Admin</option>
                                        </select>
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                                        <button 
                                            onClick={() => handleDeleteUser(user.id)}
                                            disabled={actionLoading}
                                            style={{ 
                                                background: 'transparent',
                                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                                color: '#ef4444',
                                                padding: '0.4rem', 
                                                borderRadius: '0.25rem',
                                                cursor: 'pointer',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                transition: 'all 0.2s'
                                            }}
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
    );
};

export default AdminUsers;

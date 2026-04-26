import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { Trash2, Users, CheckCircle, XCircle, Shield, User, Wrench, Search } from 'lucide-react';

const roleConfig = {
    ROLE_ADMIN:      { label: 'Admin',      color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe', icon: Shield },
    ROLE_TECHNICIAN: { label: 'Technician', color: '#059669', bg: '#ecfdf5', border: '#a7f3d0', icon: Wrench },
    ROLE_USER:       { label: 'User',       color: '#0284c7', bg: '#f0f9ff', border: '#bae6fd', icon: User },
};

const RoleBadge = ({ role }) => {
    const cfg = roleConfig[role] || roleConfig.ROLE_USER;
    const Icon = cfg.icon;
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '5px 10px', borderRadius: '999px',
            background: cfg.bg, border: `1px solid ${cfg.border}`,
            color: cfg.color, fontSize: '12px', fontWeight: '800',
            textTransform: 'uppercase'
        }}>
            <Icon size={12} /> {cfg.label}
        </span>
    );
};

const getInitials = (name = '') =>
    name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

const avatarColors = [
    '#f8fafc',
];

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [feedback, setFeedback] = useState({ message: '', type: '' });
    const [search, setSearch] = useState('');

    const showFeedback = (message, type) => {
        setFeedback({ message, type });
        setTimeout(() => setFeedback({ message: '', type: '' }), 3000);
    };

    const fetchUsers = async () => {
        try {
            const res = await api.get('/admin/users');
            setUsers(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            showFeedback('Failed to load users.', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchUsers(); }, []);

    const handleRoleChange = async (userId, newRole) => {
        const prev = users;
        setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
        try {
            setActionLoading(true);
            await api.put(`/admin/users/${userId}/role`, { role: newRole });
            showFeedback('Role updated successfully!', 'success');
            await fetchUsers();
        } catch (err) {
            setUsers(prev);
            showFeedback(err?.response?.data?.message || 'Failed to update role.', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;
        try {
            setActionLoading(true);
            await api.delete(`/admin/users/${userId}`);
            setUsers(users.filter(u => u.id !== userId));
            showFeedback('User deleted successfully!', 'success');
        } catch (err) {
            showFeedback('Failed to delete user.', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) return <div className="loader"></div>;

    const filtered = users.filter(u =>
        u.name?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div style={{ padding: '24px', maxWidth: '1340px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '20px', marginBottom: '24px' }}>
                <div>
                    <p style={eyebrow}>Administration Control</p>
                    <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '850', color: '#0f172a', letterSpacing: '0' }}>
                        User Management
                    </h1>
                    <p style={{ margin: '6px 0 0', color: '#64748b', fontSize: '14px' }}>
                        Manage platform access, assign technical roles, and oversee user activity.
                    </p>
                </div>

                <div style={{ position: 'relative', width: '320px' }}>
                    <Search size={17} style={{ position: 'absolute', left: '13px', top: '12px', color: '#64748b' }} />
                    <input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search by name or email..."
                        style={{ ...inputStyle, paddingLeft: '40px' }}
                    />
                </div>
            </div>

            {feedback.message && (
                <div style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '12px 16px', marginBottom: '20px', borderRadius: '8px',
                    background: feedback.type === 'success' ? '#f0fdf4' : '#fef2f2',
                    border: `1px solid ${feedback.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
                    color: feedback.type === 'success' ? '#166534' : '#991b1b',
                    fontSize: '14px', fontWeight: '700',
                }}>
                    {feedback.type === 'success' ? <CheckCircle size={18} /> : <XCircle size={18} />}
                    {feedback.message}
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '14px', marginBottom: '22px' }}>
                {Object.entries(roleConfig).map(([key, cfg]) => {
                    const count = users.filter(u => u.role === key).length;
                    const Icon = cfg.icon;
                    return (
                        <div key={key} style={{
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
                                background: `${cfg.color}14`,
                                color: cfg.color,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                            }}>
                                <Icon size={22} />
                            </div>
                            <div>
                                <div style={{ fontSize: '22px', fontWeight: '850', color: '#0f172a', lineHeight: 1 }}>{count}</div>
                                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '5px', fontWeight: '700' }}>{cfg.label}s</div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                        <thead>
                            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                                {['#', 'User', 'Email', 'Current Role', 'Change Role', 'Actions'].map((heading) => (
                                    <th key={heading} style={{
                                        padding: '12px 16px',
                                        textAlign: heading === 'Actions' ? 'right' : 'left',
                                        fontWeight: '850',
                                        color: '#334155',
                                        fontSize: '12px',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0',
                                    }}>
                                        {heading}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody style={{ opacity: actionLoading ? 0.6 : 1, transition: 'opacity 0.2s' }}>
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={6} style={{ padding: '42px', textAlign: 'center', color: '#94a3b8', fontWeight: '700' }}>
                                        No users found.
                                    </td>
                                </tr>
                            ) : filtered.map((user, index) => (
                                <tr key={user.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '14px 16px', color: '#64748b', fontSize: '13px' }}>{index + 1}</td>
                                    <td style={{ padding: '14px 16px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{
                                                width: '36px', height: '36px', borderRadius: '50%',
                                                background: '#f1f5f9', border: '1px solid #e2e8f0',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontWeight: '800', fontSize: '12px', color: '#0f172a',
                                                flexShrink: 0,
                                            }}>
                                                {getInitials(user.name)}
                                            </div>
                                            <span style={{ color: '#0f172a', fontWeight: '800', fontSize: '14px' }}>{user.name}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '14px 16px', color: '#475569', fontSize: '13px' }}>{user.email}</td>
                                    <td style={{ padding: '14px 16px' }}><RoleBadge role={user.role} /></td>
                                    <td style={{ padding: '14px 16px' }}>
                                        <select
                                            value={user.role}
                                            onChange={e => handleRoleChange(user.id, e.target.value)}
                                            disabled={actionLoading}
                                            style={{
                                                background: '#fff',
                                                color: '#334155',
                                                border: '1px solid #d1d5db',
                                                padding: '6px 12px',
                                                borderRadius: '8px',
                                                fontSize: '13px',
                                                fontWeight: '600',
                                                outline: 'none',
                                                cursor: actionLoading ? 'not-allowed' : 'pointer',
                                            }}
                                        >
                                            <option value="ROLE_USER">User</option>
                                            <option value="ROLE_TECHNICIAN">Technician</option>
                                            <option value="ROLE_ADMIN">Admin</option>
                                        </select>
                                    </td>
                                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                                        <button
                                            onClick={() => handleDeleteUser(user.id)}
                                            disabled={actionLoading}
                                            title="Delete user"
                                            style={{
                                                width: '34px',
                                                height: '32px',
                                                borderRadius: '8px',
                                                border: '1px solid #dc262624',
                                                color: '#dc2626',
                                                background: '#dc26260d',
                                                cursor: 'pointer',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
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

                <div style={{ padding: '12px 16px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748b', fontSize: '12px', fontWeight: '700' }}>
                    <span>Showing {filtered.length} of {users.length} users</span>
                    {actionLoading && <span style={{ color: '#0f766e' }}>Saving changes…</span>}
                </div>
            </div>
        </div>
    );
};

const eyebrow = {
    margin: '0 0 6px',
    color: '#0f766e',
    fontSize: '12px',
    fontWeight: '850',
    textTransform: 'uppercase',
    letterSpacing: '0',
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

export default AdminUsers;

import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { Trash2, Users, CheckCircle, XCircle, Shield, User, Wrench, Search } from 'lucide-react';

const roleConfig = {
    ROLE_ADMIN:      { label: 'Admin',      color: '#a78bfa', bg: 'rgba(167,139,250,0.15)', border: 'rgba(167,139,250,0.3)' },
    ROLE_TECHNICIAN: { label: 'Technician', color: '#34d399', bg: 'rgba(52,211,153,0.15)',  border: 'rgba(52,211,153,0.3)'  },
    ROLE_USER:       { label: 'User',       color: '#60a5fa', bg: 'rgba(96,165,250,0.15)',  border: 'rgba(96,165,250,0.3)'  },
};

const RoleBadge = ({ role }) => {
    const cfg = roleConfig[role] || roleConfig.ROLE_USER;
    const Icon = role === 'ROLE_ADMIN' ? Shield : role === 'ROLE_TECHNICIAN' ? Wrench : User;
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
            padding: '0.25rem 0.65rem', borderRadius: '999px',
            background: cfg.bg, border: `1px solid ${cfg.border}`,
            color: cfg.color, fontSize: '0.78rem', fontWeight: '600',
        }}>
            <Icon size={12} /> {cfg.label}
        </span>
    );
};

const getInitials = (name = '') =>
    name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

const avatarColors = [
    'linear-gradient(135deg, #6366f1, #8b5cf6)',
    'linear-gradient(135deg, #06b6d4, #3b82f6)',
    'linear-gradient(135deg, #10b981, #06b6d4)',
    'linear-gradient(135deg, #f59e0b, #ef4444)',
    'linear-gradient(135deg, #ec4899, #8b5cf6)',
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
        <div className="page-container">
            {/* Page Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                        width: 44, height: 44, borderRadius: '12px',
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(99,102,241,0.4)'
                    }}>
                        <Users size={22} color="#fff" />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '1.4rem', fontWeight: '700', color: 'rgb(98, 97, 97)', margin: 0 }}>User Management</h1>
                        <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>{users.length} registered users</p>
                    </div>
                </div>

                {/* Search Bar */}
                <div style={{ position: 'relative', minWidth: '250px' }}>
                    <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        style={{
                            width: '100%', padding: '0.6rem 1rem 0.6rem 2.25rem',
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '0.5rem', color: '#f8fafc',
                            fontFamily: 'inherit', fontSize: '0.875rem', outline: 'none',
                        }}
                    />
                </div>
            </div>

            {/* Feedback Banner */}
            {feedback.message && (
                <div style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    padding: '0.75rem 1rem', marginBottom: '1rem', borderRadius: '0.5rem',
                    background: feedback.type === 'success' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                    border: `1px solid ${feedback.type === 'success' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
                    color: feedback.type === 'success' ? '#10b981' : '#ef4444',
                    fontSize: '0.9rem', fontWeight: '500',
                }}>
                    {feedback.type === 'success' ? <CheckCircle size={18} /> : <XCircle size={18} />}
                    {feedback.message}
                </div>
            )}

            {/* Stats Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                {Object.entries(roleConfig).map(([key, cfg]) => {
                    const count = users.filter(u => u.role === key).length;
                    const Icon = key === 'ROLE_ADMIN' ? Shield : key === 'ROLE_TECHNICIAN' ? Wrench : User;
                    return (
                        <div key={key} style={{
                            background: cfg.bg, border: `1px solid ${cfg.border}`,
                            borderRadius: '0.75rem', padding: '1rem',
                            display: 'flex', alignItems: 'center', gap: '0.75rem'
                        }}>
                            <div style={{
                                width: 36, height: 36, borderRadius: '8px',
                                background: `${cfg.border}`, display: 'flex',
                                alignItems: 'center', justifyContent: 'center'
                            }}>
                                <Icon size={18} color={cfg.color} />
                            </div>
                            <div>
                                <div style={{ fontSize: '1.4rem', fontWeight: '700', color: cfg.color, lineHeight: 1 }}>{count}</div>
                                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>{cfg.label}s</div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Table Card */}
            <div style={{
                background: 'rgba(30, 41, 59, 0.7)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '1rem',
                overflow: 'hidden',
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                opacity: actionLoading ? 0.7 : 1,
                transition: 'opacity 0.2s'
            }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: 'rgba(99,102,241,0.1)', borderBottom: '1px solid rgba(99,102,241,0.2)' }}>
                                <th style={{ padding: '1rem 1.25rem', color: '#a5b4fc', fontWeight: '600', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'left' }}>#</th>
                                <th style={{ padding: '1rem 1.25rem', color: '#a5b4fc', fontWeight: '600', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'left' }}>User</th>
                                <th style={{ padding: '1rem 1.25rem', color: '#a5b4fc', fontWeight: '600', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'left' }}>Email</th>
                                <th style={{ padding: '1rem 1.25rem', color: '#a5b4fc', fontWeight: '600', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'left' }}>Current Role</th>
                                <th style={{ padding: '1rem 1.25rem', color: '#a5b4fc', fontWeight: '600', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'left' }}>Change Role</th>
                                <th style={{ padding: '1rem 1.25rem', color: '#a5b4fc', fontWeight: '600', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                                        No users found.
                                    </td>
                                </tr>
                            ) : filtered.map((user, index) => (
                                <tr key={user.id} style={{
                                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                                    transition: 'background 0.15s',
                                    cursor: 'default',
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                >
                                    {/* Index */}
                                    <td style={{ padding: '1rem 1.25rem', color: '#475569', fontSize: '0.85rem' }}>
                                        {index + 1}
                                    </td>

                                    {/* Avatar + Name */}
                                    <td style={{ padding: '0.85rem 1.25rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div style={{
                                                width: 38, height: 38, borderRadius: '50%',
                                                background: avatarColors[index % avatarColors.length],
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontWeight: '700', fontSize: '0.85rem', color: '#fff',
                                                flexShrink: 0,
                                            }}>
                                                {getInitials(user.name)}
                                            </div>
                                            <span style={{ color: '#f1f5f9', fontWeight: '500', fontSize: '0.9rem' }}>{user.name}</span>
                                        </div>
                                    </td>

                                    {/* Email */}
                                    <td style={{ padding: '1rem 1.25rem', color: '#94a3b8', fontSize: '0.875rem' }}>
                                        {user.email}
                                    </td>

                                    {/* Current Role Badge */}
                                    <td style={{ padding: '1rem 1.25rem' }}>
                                        <RoleBadge role={user.role} />
                                    </td>

                                    {/* Role Selector */}
                                    <td style={{ padding: '0.85rem 1.25rem' }}>
                                        <select
                                            value={user.role}
                                            onChange={e => handleRoleChange(user.id, e.target.value)}
                                            disabled={actionLoading}
                                            style={{
                                                background: 'rgba(15,23,42,0.8)',
                                                color: '#e2e8f0',
                                                border: '1px solid rgba(99,102,241,0.3)',
                                                padding: '0.45rem 0.75rem',
                                                borderRadius: '0.5rem',
                                                outline: 'none',
                                                fontFamily: 'inherit',
                                                fontSize: '0.85rem',
                                                cursor: actionLoading ? 'not-allowed' : 'pointer',
                                                appearance: 'auto',
                                            }}
                                        >
                                            <option value="ROLE_USER">User</option>
                                            <option value="ROLE_TECHNICIAN">Technician</option>
                                            <option value="ROLE_ADMIN">Admin</option>
                                        </select>
                                    </td>

                                    {/* Delete Button */}
                                    <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                                        <button
                                            onClick={() => handleDeleteUser(user.id)}
                                            disabled={actionLoading}
                                            title="Delete user"
                                            style={{
                                                background: 'rgba(239,68,68,0.1)',
                                                border: '1px solid rgba(239,68,68,0.25)',
                                                color: '#f87171',
                                                padding: '0.45rem 0.6rem',
                                                borderRadius: '0.5rem',
                                                cursor: actionLoading ? 'not-allowed' : 'pointer',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                transition: 'all 0.2s',
                                            }}
                                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.25)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.5)'; }}
                                            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.25)'; }}
                                        >
                                            <Trash2 size={15} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                <div style={{
                    padding: '0.75rem 1.25rem',
                    borderTop: '1px solid rgba(255,255,255,0.06)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    color: '#64748b', fontSize: '0.8rem'
                }}>
                    <span>Showing {filtered.length} of {users.length} users</span>
                    {actionLoading && <span style={{ color: '#6366f1' }}>Saving changes…</span>}
                </div>
            </div>
        </div>
    );
};

export default AdminUsers;

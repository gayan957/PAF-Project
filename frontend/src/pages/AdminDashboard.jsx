import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { Users, Activity, Trash2, Ticket as TicketIcon, UserPlus, TrendingUp, Bookmark, Diamond, Home } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import TicketList from '../components/tickets/TicketList';
import AssignModal from '../components/tickets/AssignModal';
import './AdminDashboard.css';

const barChartData = [
  { name: 'JAN', search: 4000, direct: 2400, bookmark: 2400 },
  { name: 'FEB', search: 3000, direct: 1398, bookmark: 2210 },
  { name: 'MAR', search: 2000, direct: 9800, bookmark: 2290 },
  { name: 'APR', search: 2780, direct: 3908, bookmark: 2000 },
  { name: 'MAY', search: 1890, direct: 4800, bookmark: 2181 },
  { name: 'JUN', search: 2390, direct: 3800, bookmark: 2500 },
  { name: 'JUL', search: 3490, direct: 4300, bookmark: 2100 },
];

const pieChartData = [
  { name: 'Search Engines', value: 30 },
  { name: 'Direct Click', value: 30 },
  { name: 'Bookmarks Click', value: 40 },
];
const pieColors = ['#ffbf96', '#047edf', '#07cdae'];

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
        <div className="admin-dashboard-container page-container">
            <div className="admin-page-header">
                <div className="admin-page-title">
                    <span className="admin-page-title-icon"><Home size={20} /></span>
                    Dashboard
                </div>
                <div className="admin-breadcrumb">
                    Overview <span style={{margin: '0 5px'}}>i</span>
                </div>
            </div>

            <div className="admin-cards-row">
                <div className="admin-gradient-card bg-gradient-danger">
                    <div className="admin-card-inner">
                        <div>
                            <div className="admin-card-title">Weekly Sales</div>
                            <div className="admin-card-value">$ 15,0000</div>
                        </div>
                        <TrendingUp size={28} className="admin-card-icon" />
                    </div>
                    <div className="admin-card-subtitle">Increased by 60%</div>
                    <div className="admin-card-decor"></div>
                    <div className="admin-card-decor-2"></div>
                </div>

                <div className="admin-gradient-card bg-gradient-info">
                    <div className="admin-card-inner">
                        <div>
                            <div className="admin-card-title">Weekly Orders</div>
                            <div className="admin-card-value">45,6334</div>
                        </div>
                        <Bookmark size={28} className="admin-card-icon" />
                    </div>
                    <div className="admin-card-subtitle">Decreased by 10%</div>
                    <div className="admin-card-decor"></div>
                    <div className="admin-card-decor-2"></div>
                </div>

                <div className="admin-gradient-card bg-gradient-success">
                    <div className="admin-card-inner">
                        <div>
                            <div className="admin-card-title">Visitors Online</div>
                            <div className="admin-card-value">95,5741</div>
                        </div>
                        <Diamond size={28} className="admin-card-icon" />
                    </div>
                    <div className="admin-card-subtitle">Increased by 5%</div>
                    <div className="admin-card-decor"></div>
                    <div className="admin-card-decor-2"></div>
                </div>
            </div>

            <div className="admin-charts-row">
                <div className="admin-chart-card">
                    <div className="admin-chart-title">
                        Visit And Sales Statistics
                        <div className="admin-chart-legend">
                            <div className="admin-legend-item">
                                <span className="admin-legend-dot" style={{background: '#8b5cf6'}}></span> CHN
                            </div>
                            <div className="admin-legend-item">
                                <span className="admin-legend-dot" style={{background: '#fe7096'}}></span> USA
                            </div>
                            <div className="admin-legend-item">
                                <span className="admin-legend-dot" style={{background: '#047edf'}}></span> UK
                            </div>
                        </div>
                    </div>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <BarChart data={barChartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'var(--text-muted)'}} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--text-muted)'}} />
                                <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{background: 'var(--bg-card)', border: 'none', borderRadius: '8px'}} />
                                <Bar dataKey="search" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={10} />
                                <Bar dataKey="direct" fill="#fe7096" radius={[4, 4, 0, 0]} barSize={10} />
                                <Bar dataKey="bookmark" fill="#047edf" radius={[4, 4, 0, 0]} barSize={10} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="admin-chart-card">
                    <div className="admin-chart-title">Traffic Sources</div>
                    <div style={{ width: '100%', height: 250 }}>
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie
                                    data={pieChartData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {pieChartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} stroke="none" />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{background: 'var(--bg-card)', border: 'none', borderRadius: '8px'}} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div style={{ marginTop: '1rem' }}>
                        <table style={{ width: '100%', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            <tbody>
                                {pieChartData.map((entry, index) => (
                                    <tr key={index} style={{ height: '30px' }}>
                                        <td>
                                            <span className="admin-legend-dot" style={{background: pieColors[index], display: 'inline-block', marginRight: '8px'}}></span>
                                            {entry.name}
                                        </td>
                                        <td style={{textAlign: 'right'}}>{entry.value}%</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Original Functionality - Styled to fit */}
            <div className="glass-panel content-card" style={{ marginTop: '2rem' }}>
                <h2 style={{ border: 'none' }}>Ticket Management Overview <span style={{fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 'normal', marginLeft: '10px'}}>(Total: {stats.tickets})</span></h2>
                <TicketList 
                    tickets={tickets} 
                    renderActions={renderAdminActions} 
                />
            </div>

            {/* User Management removed to its own page */}

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


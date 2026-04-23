import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { Calendar, Ticket, BookOpen } from 'lucide-react';

const UserDashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await api.get('/dashboard/user');
                setData(response.data);
            } catch (error) {
                console.error("Error fetching dashboard data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) return <div className="loader"></div>;

    return (
        <div className="page-container">
            <div className="container">
                <div className="dashboard-header">
                    <h1 className="dashboard-title">User Dashboard</h1>
                </div>

                <div className="dashboard-grid">
                    <div className="glass-panel stat-card">
                        <div className="stat-icon">
                            <Ticket size={24} />
                        </div>
                        <div className="stat-content">
                            <h3>Active Tickets</h3>
                            <p>3</p>
                        </div>
                    </div>
                    <div className="glass-panel stat-card">
                        <div className="stat-icon" style={{ color: 'var(--success)', background: 'rgba(16, 185, 129, 0.1)' }}>
                            <Calendar size={24} />
                        </div>
                        <div className="stat-content">
                            <h3>Upcoming Bookings</h3>
                            <p>1</p>
                        </div>
                    </div>
                    <div className="glass-panel stat-card">
                        <div className="stat-icon" style={{ color: 'var(--accent)', background: 'rgba(139, 92, 246, 0.1)' }}>
                            <BookOpen size={24} />
                        </div>
                        <div className="stat-content">
                            <h3>Courses</h3>
                            <p>5</p>
                        </div>
                    </div>
                </div>

                <div className="glass-panel content-card">
                    <h2>Server Message</h2>
                    <div className="message-box">
                        {data || "No data received from server."}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;

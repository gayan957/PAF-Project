import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { Wrench, AlertCircle, CheckCircle } from 'lucide-react';

const TechnicianDashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await api.get('/dashboard/technician');
                setData(response.data);
            } catch (error) {
                console.error("Error fetching technician data", error);
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
                    <h1 className="dashboard-title">Technician Dashboard</h1>
                </div>

                <div className="dashboard-grid">
                    <div className="glass-panel stat-card">
                        <div className="stat-icon" style={{ color: 'var(--danger)', background: 'rgba(239, 68, 68, 0.1)' }}>
                            <AlertCircle size={24} />
                        </div>
                        <div className="stat-content">
                            <h3>Pending Tickets</h3>
                            <p>12</p>
                        </div>
                    </div>
                    <div className="glass-panel stat-card">
                        <div className="stat-icon" style={{ color: 'var(--primary)', background: 'rgba(59, 130, 246, 0.1)' }}>
                            <Wrench size={24} />
                        </div>
                        <div className="stat-content">
                            <h3>In Progress</h3>
                            <p>4</p>
                        </div>
                    </div>
                    <div className="glass-panel stat-card">
                        <div className="stat-icon" style={{ color: 'var(--success)', background: 'rgba(16, 185, 129, 0.1)' }}>
                            <CheckCircle size={24} />
                        </div>
                        <div className="stat-content">
                            <h3>Resolved Today</h3>
                            <p>7</p>
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

export default TechnicianDashboard;

import React from 'react';
import { useNavigate } from 'react-router-dom';
import PublicNavbar from '../components/PublicNavbar';
import './Home.css';

const Home = () => {
    const navigate = useNavigate();

    return (
        <div className="home-wrapper">
            {/* Top Navigation */}
            <PublicNavbar />

            {/* Hero Section */}
            <section className="home-hero" style={{ backgroundImage: 'url(/hero-bg.png)' }}>
                <div className="hero-overlay">
                    <div className="hero-content-box">
                        <h1 className="hero-title">Welcome to UniPortal</h1>
                        <p className="hero-subtitle">
                            Your unified platform for managing campus services, booking facilities, and tracking support requests with ease. Join our vibrant community today.
                        </p>
                        <div className="hero-buttons">
                            <button onClick={() => navigate('/register')} className="btn-hero-primary">Get Started</button>
                            <button onClick={() => navigate('/login')} className="btn-hero-outline">Log In</button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="home-features-section">
                <div className="features-container">
                    <div className="feature-card">
                        <div className="feature-icon secure-icon"></div>
                        <h3>Secure Access</h3>
                        <p>Role-based dashboards tailored for Users, Admins, and Technicians.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon booking-icon"></div>
                        <h3>Easy Bookings</h3>
                        <p>Quickly reserve facilities and view your upcoming schedule.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon support-icon"></div>
                        <h3>Support Tickets</h3>
                        <p>Submit and track maintenance requests directly from your portal.</p>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;

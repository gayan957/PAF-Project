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

            {/* Footer */}
            <footer className="home-footer">
                <div className="footer-container">
                    {/* Brand column */}
                    <div className="footer-brand">
                        <div className="footer-logo">
                            <div className="shield-icon">
                                <span>U</span>
                            </div>
                            <div className="logo-text">
                                <span className="brand-name" style={{ color: '#fff' }}>UniPortal</span>
                                <span className="brand-sub" style={{ color: '#94a3b8' }}>University System</span>
                            </div>
                        </div>
                        <p className="footer-desc">
                            A unified campus platform for managing facilities, support tickets, and university services — all in one place.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div className="footer-col">
                        <h4 className="footer-col-title">Quick Links</h4>
                        <ul className="footer-links">
                            <li><a href="/">Home</a></li>
                            <li><a href="/login">Log In</a></li>
                            <li><a href="/register">Register</a></li>
                        </ul>
                    </div>

                    {/* Services */}
                    <div className="footer-col">
                        <h4 className="footer-col-title">Services</h4>
                        <ul className="footer-links">
                            <li><a href="/login">Facility Bookings</a></li>
                            <li><a href="/login">Support Tickets</a></li>
                            <li><a href="/login">Admin Dashboard</a></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div className="footer-col">
                        <h4 className="footer-col-title">Contact</h4>
                        <ul className="footer-links footer-contact">
                            <li>📍 University Campus, Main Road</li>
                            <li>📧 support@uniportal.edu</li>
                            <li>📞 +94 11 234 5678</li>
                        </ul>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>© {new Date().getFullYear()} UniPortal · University Management System. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default Home;

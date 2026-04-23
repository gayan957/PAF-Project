import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, UserPlus } from 'lucide-react';
import './Home.css';

const Home = () => {
    const navigate = useNavigate();

    return (
        <div className="home-page">
            <div className="home-container">
                <div className="home-content">
                    <h1 className="home-title">Welcome to UniPortal</h1>
                    <p className="home-subtitle">
                        Your unified platform for managing campus services, booking facilities, and tracking support requests with ease.
                    </p>
                    
                    <div className="home-actions">
                        <button onClick={() => navigate('/login')} className="btn home-btn-primary">
                            <LogIn size={20} />
                            Log In
                        </button>
                        {/* Since it's OAuth2, sign up and login both go through the Google flow typically, 
                            but we'll route both to login to initiate the flow as per standard OAuth behavior,
                            or you can add a separate flow if you intend to add local registration later. */}
                        <button onClick={() => navigate('/login')} className="btn home-btn-outline">
                            <UserPlus size={20} />
                            Sign Up
                        </button>
                    </div>
                </div>
                
                <div className="home-features">
                    <div className="feature-card">
                        <h3>Secure Access</h3>
                        <p>Role-based dashboards tailored for Users, Admins, and Technicians.</p>
                    </div>
                    <div className="feature-card">
                        <h3>Easy Bookings</h3>
                        <p>Quickly reserve facilities and view your upcoming schedule.</p>
                    </div>
                    <div className="feature-card">
                        <h3>Support Tickets</h3>
                        <p>Submit and track maintenance requests directly from your portal.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;

import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, Search } from 'lucide-react';
import '../pages/Home.css'; // Reuse the existing header styles

const PublicNavbar = () => {
    const navigate = useNavigate();

    return (
        <header className="home-header">
            <div className="home-header-container">
                <div className="home-logo">
                    <div className="shield-icon">
                        <span>U</span>
                    </div>
                    <div className="logo-text">
                        <span className="brand-name">UniPortal</span>
                        <span className="brand-sub">University System</span>
                    </div>
                </div>

                <nav className="home-nav-links">
                    <Link to="/" className="active">Home</Link>
                    <Link to="/">About</Link>
                    <Link to="/">Academics</Link>
                    <Link to="/">Admissions</Link>
                    <Link to="/">Campus Life</Link>
                </nav>

                <div className="home-header-actions">
                    <button className="search-btn"><Search size={18} /></button>
                    <button onClick={() => navigate('/login')} className="btn-login">
                        <LogIn size={16} style={{marginRight: '6px'}} />
                        Log In
                    </button>
                    <button onClick={() => navigate('/register')} className="btn-apply">
                        Apply Now
                    </button>
                </div>
            </div>
        </header>
    );
};

export default PublicNavbar;

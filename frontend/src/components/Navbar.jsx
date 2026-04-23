import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    if (!user) return null;

    return (
        <nav className="navbar">
            <div className="container">
                <div className="navbar-brand">UniPortal</div>
                
                <div className="navbar-nav" style={{ gap: '2rem' }}>
                    <div style={{ display: 'flex', gap: '1.5rem' }}>
                        <a href="/user-dashboard" style={{ color: 'inherit', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '500' }}>Dashboard</a>
                        <a href="/tickets" style={{ color: 'inherit', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '500' }}>Tickets</a>
                    </div>
                    <div className="nav-user">
                        <img 
                            src={user.avatarUrl || "https://ui-avatars.com/api/?name=" + user.name} 
                            alt="Profile" 
                            className="nav-avatar"
                        />
                        <div>
                            <div style={{ fontWeight: 500 }}>{user.name}</div>
                            <div className="nav-role">{user.role.replace('ROLE_', '')}</div>
                        </div>
                    </div>
                    
                    <button onClick={handleLogout} className="btn btn-outline" style={{ padding: '0.5rem', borderRadius: '50%' }} title="Logout">
                        <LogOut size={18} />
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;

import React from 'react';
import { Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './notifications/NotificationBell';
import './TopHeader.css';

const TopHeader = ({ title = "Dashboard" }) => {
    const { user } = useAuth();

    return (
        <header className="top-header">
            <div className="header-left">
                <div className="search-bar">
                    <Search size={18} className="search-icon" />
                    <input type="text" placeholder="Search..." />
                </div>
            </div>
            
            <div className="header-right">
                <NotificationBell />
                
                {user && (
                    <div className="user-profile">
                        <img 
                            src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.name}&background=random`} 
                            alt="Profile" 
                            className="header-avatar"
                        />
                        <div className="user-info">
                            <span className="user-name">{user.name}</span>
                            <span className="user-role">{user.role.replace('ROLE_', '')}</span>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
};

export default TopHeader;

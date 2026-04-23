import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, BookOpen, Calendar, CreditCard, Award, HelpCircle, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css'; // We will create this

const Sidebar = () => {
    const { logout } = useAuth();

    return (
        <aside className="sidebar">
            <div className="sidebar-brand">
                <div className="brand-logo">
                    <span>U</span>
                </div>
                <span className="brand-title">Student Portal</span>
            </div>
            
            <nav className="sidebar-nav">
                <NavLink to="/user-dashboard" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                    <LayoutDashboard size={20} />
                    <span>Dashboard</span>
                </NavLink>
                <NavLink to="/courses" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                    <BookOpen size={20} />
                    <span>Courses</span>
                </NavLink>
                <NavLink to="/tickets" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                    <Calendar size={20} />
                    <span>Tickets / Schedule</span>
                </NavLink>
                <NavLink to="/finances" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                    <CreditCard size={20} />
                    <span>Finances</span>
                </NavLink>
                <NavLink to="/results" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                    <Award size={20} />
                    <span>Results</span>
                </NavLink>
                <NavLink to="/help" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                    <HelpCircle size={20} />
                    <span>Help</span>
                </NavLink>
            </nav>

            <div className="sidebar-footer">
                <button className="nav-item logout-btn" onClick={logout}>
                    <LogOut size={20} />
                    <span>Log out</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;

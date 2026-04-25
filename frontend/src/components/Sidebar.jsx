import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, BookOpen, Calendar, CalendarCheck, CreditCard, Award, HelpCircle, LogOut, Users, Ticket as TicketIcon, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

const Sidebar = () => {
    const { user, logout } = useAuth();
    
    const isAdmin = user?.role === 'ROLE_ADMIN' || user?.role === 'ADMIN';
    const isTechnician = user?.role === 'ROLE_TECHNICIAN' || user?.role === 'TECHNICIAN';

    return (
        <aside className="sidebar">
            <div className="sidebar-brand">
                <div className="brand-logo">
                    <span>{isAdmin ? 'A' : (isTechnician ? 'T' : 'U')}</span>
                </div>
                <span className="brand-title">
                    {isAdmin ? 'Admin Portal' : (isTechnician ? 'Tech Portal' : 'Student Portal')}
                </span>
            </div>
            
            <nav className="sidebar-nav">
                {isAdmin ? (
                    <>
                        <NavLink to="/admin-dashboard" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                            <LayoutDashboard size={20} />
                            <span>Dashboard</span>
                        </NavLink>
                        <NavLink to="/admin/users" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                            <Users size={20} />
                            <span>User Management</span>
                        </NavLink>
                        <NavLink to="/admin/bookings" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                            <CalendarCheck size={20} />
                            <span>Booking Management</span>
                        </NavLink>
                        <NavLink to="/tickets" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                            <TicketIcon size={20} />
                            <span>Ticket Management</span>
                        </NavLink>
                        <NavLink to="/profile" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                            <User size={20} />
                            <span>Profile</span>
                        </NavLink>
                    </>
                ) : isTechnician ? (
                    <>
                        <NavLink to="/technician-dashboard" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                            <LayoutDashboard size={20} />
                            <span>Dashboard</span>
                        </NavLink>
                        <NavLink to="/tickets" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                            <Calendar size={20} />
                            <span>Assigned Tickets</span>
                        </NavLink>
                        <NavLink to="/profile" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                            <User size={20} />
                            <span>Profile</span>
                        </NavLink>
                    </>
                ) : (
                    <>
                        <NavLink to="/user-dashboard" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                            <LayoutDashboard size={20} />
                            <span>Dashboard</span>
                        </NavLink>
                        <NavLink to="/courses" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                            <BookOpen size={20} />
                            <span>Courses</span>
                        </NavLink>
                        <NavLink to="/bookings" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                            <CalendarCheck size={20} />
                            <span>My Bookings</span>
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
                        <NavLink to="/profile" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                            <User size={20} />
                            <span>Profile</span>
                        </NavLink>
                    </>
                )}
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

import React from 'react';
import { Bell } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import NotificationPanel from './NotificationPanel';
import './NotificationPanel.css';

export default function NotificationBell() {
    const { unreadCount, togglePanel } = useNotifications();

    return (
        <div className="notif-bell-wrap">
            <button
                className="icon-btn"
                onClick={togglePanel}
                title="Notifications"
                aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="notif-badge">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            <NotificationPanel />
        </div>
    );
}

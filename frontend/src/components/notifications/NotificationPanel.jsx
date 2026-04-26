import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Bell, CheckCheck, Trash2, X,
    CalendarCheck, CalendarX, TicketCheck, UserCheck, MessageSquare,
} from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import './NotificationPanel.css';

const TYPE_META = {
    BOOKING_APPROVED:    { icon: CalendarCheck, color: '#10b981', bg: '#d1fae5', label: 'Booking' },
    BOOKING_REJECTED:    { icon: CalendarX,     color: '#ef4444', bg: '#fee2e2', label: 'Booking' },
    BOOKING_CANCELLED:   { icon: CalendarX,     color: '#f59e0b', bg: '#fef3c7', label: 'Booking' },
    TICKET_STATUS_UPDATED:{ icon: TicketCheck,  color: '#6366f1', bg: '#ede9fe', label: 'Ticket'  },
    TICKET_ASSIGNED:     { icon: UserCheck,     color: '#0284c7', bg: '#e0f2fe', label: 'Ticket'  },
    TICKET_COMMENT_ADDED:{ icon: MessageSquare, color: '#7c3aed', bg: '#f3e8ff', label: 'Comment' },
};

function timeAgo(dateStr) {
    const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
    if (diff < 60)   return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400)return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}

function destinationFor(notification) {
    if (!notification.referenceId) return null;
    if (notification.referenceType === 'BOOKING') return `/bookings`;
    if (notification.referenceType === 'TICKET')  return `/tickets/${notification.referenceId}`;
    return null;
}

export default function NotificationPanel() {
    const navigate = useNavigate();
    const {
        notifications, unreadCount, loading,
        panelOpen, closePanel,
        markAsRead, markAllAsRead,
        deleteNotification, clearAll,
    } = useNotifications();

    const handleItemClick = useCallback((notif) => {
        if (!notif.read) markAsRead(notif.id);
        const dest = destinationFor(notif);
        if (dest) { navigate(dest); closePanel(); }
    }, [markAsRead, navigate, closePanel]);

    if (!panelOpen) return null;

    return (
        <>
            <div className="notif-overlay" onClick={closePanel} />

            <div className="notif-panel" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="notif-header">
                    <h3>
                        Notifications
                        {unreadCount > 0 && (
                            <span style={{
                                marginLeft: 8, background: '#6366f1', color: '#fff',
                                fontSize: 11, fontWeight: 800,
                                padding: '1px 7px', borderRadius: 999,
                            }}>
                                {unreadCount}
                            </span>
                        )}
                    </h3>
                    <div className="notif-header-actions">
                        {unreadCount > 0 && (
                            <button className="notif-btn-text" onClick={markAllAsRead} title="Mark all as read">
                                <CheckCheck size={13} style={{ marginRight: 3, verticalAlign: 'middle' }} />
                                Mark all read
                            </button>
                        )}
                        {notifications.length > 0 && (
                            <button className="notif-btn-text danger" onClick={clearAll} title="Clear all">
                                <Trash2 size={13} style={{ marginRight: 3, verticalAlign: 'middle' }} />
                                Clear
                            </button>
                        )}
                    </div>
                </div>

                {/* Body */}
                <div className="notif-list">
                    {loading && notifications.length === 0 ? (
                        <div className="notif-empty">
                            <Bell size={32} strokeWidth={1.5} />
                            <p>Loading…</p>
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="notif-empty">
                            <Bell size={32} strokeWidth={1.5} />
                            <p>You're all caught up!</p>
                        </div>
                    ) : (
                        notifications.map(notif => {
                            const meta = TYPE_META[notif.type] || {
                                icon: Bell, color: '#64748b', bg: '#f1f5f9',
                            };
                            const Icon = meta.icon;
                            return (
                                <div
                                    key={notif.id}
                                    className={`notif-item${notif.read ? '' : ' unread'}`}
                                    onClick={() => handleItemClick(notif)}
                                >
                                    <div className="notif-icon-wrap" style={{ background: meta.bg }}>
                                        <Icon size={18} color={meta.color} />
                                    </div>

                                    <div className="notif-body">
                                        <div className="notif-title">{notif.title}</div>
                                        <div className="notif-message">{notif.message}</div>
                                        <div className="notif-time">{timeAgo(notif.createdAt)}</div>
                                    </div>

                                    {!notif.read && <div className="notif-unread-dot" />}

                                    <button
                                        className="notif-delete-btn"
                                        onClick={e => { e.stopPropagation(); deleteNotification(notif.id); }}
                                        title="Dismiss"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </>
    );
}

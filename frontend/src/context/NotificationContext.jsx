import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { notificationApi } from '../api/notificationApi';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(null);

const POLL_INTERVAL_MS = 20000; // 20 s

export const NotificationProvider = ({ children }) => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount]     = useState(0);
    const [panelOpen, setPanelOpen]         = useState(false);
    const [loading, setLoading]             = useState(false);
    const pollRef = useRef(null);

    const fetchNotifications = useCallback(async () => {
        if (!user) return;
        try {
            setLoading(true);
            const res = await notificationApi.getAll();
            setNotifications(res.data);
            setUnreadCount(res.data.filter(n => !n.read).length);
        } catch {
            // silently ignore — user may not be authenticated yet
        } finally {
            setLoading(false);
        }
    }, [user]);

    // Initial fetch + poll
    useEffect(() => {
        if (!user) {
            setNotifications([]);
            setUnreadCount(0);
            return;
        }
        fetchNotifications();
        pollRef.current = setInterval(fetchNotifications, POLL_INTERVAL_MS);
        return () => clearInterval(pollRef.current);
    }, [user, fetchNotifications]);

    const markAsRead = useCallback(async (id) => {
        try {
            const res = await notificationApi.markAsRead(id);
            setNotifications(prev => prev.map(n => n.id === id ? res.data : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error('Failed to mark notification as read', err);
        }
    }, []);

    const markAllAsRead = useCallback(async () => {
        try {
            await notificationApi.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch (err) {
            console.error('Failed to mark all as read', err);
        }
    }, []);

    const deleteNotification = useCallback(async (id) => {
        try {
            await notificationApi.deleteOne(id);
            setNotifications(prev => {
                const removed = prev.find(n => n.id === id);
                if (removed && !removed.read) setUnreadCount(c => Math.max(0, c - 1));
                return prev.filter(n => n.id !== id);
            });
        } catch (err) {
            console.error('Failed to delete notification', err);
        }
    }, []);

    const clearAll = useCallback(async () => {
        try {
            await notificationApi.clearAll();
            setNotifications([]);
            setUnreadCount(0);
        } catch (err) {
            console.error('Failed to clear notifications', err);
        }
    }, []);

    const togglePanel = useCallback(() => setPanelOpen(o => !o), []);
    const closePanel  = useCallback(() => setPanelOpen(false), []);

    return (
        <NotificationContext.Provider value={{
            notifications,
            unreadCount,
            loading,
            panelOpen,
            togglePanel,
            closePanel,
            markAsRead,
            markAllAsRead,
            deleteNotification,
            clearAll,
            refresh: fetchNotifications,
        }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => {
    const ctx = useContext(NotificationContext);
    if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
    return ctx;
};

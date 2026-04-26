import api from './axios';

export const notificationApi = {
    getAll: ()                    => api.get('/notifications'),
    getUnreadCount: ()            => api.get('/notifications/unread-count'),
    markAsRead: (id)              => api.put(`/notifications/${id}/read`),
    markAllAsRead: ()             => api.put('/notifications/read-all'),
    deleteOne: (id)               => api.delete(`/notifications/${id}`),
    clearAll: ()                  => api.delete('/notifications'),
};

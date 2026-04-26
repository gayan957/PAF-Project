import api from './axios';

export const createBooking = (data) =>
    api.post('/v1/bookings', data);

export const getMyBookings = (params = {}) =>
    api.get('/v1/bookings/my', { params });

export const getBookingById = (id) =>
    api.get(`/v1/bookings/${id}`);

export const getAllBookings = (params = {}) =>
    api.get('/v1/bookings', { params });

export const approveBooking = (id) =>
    api.patch(`/v1/bookings/${id}/approve`);

export const rejectBooking = (id, reason) =>
    api.patch(`/v1/bookings/${id}/reject`, null, { params: { reason } });

export const cancelBooking = (id) =>
    api.patch(`/v1/bookings/${id}/cancel`);

export const getResourceAvailability = (resourceId, from, to) =>
    api.get(`/v1/bookings/resource/${resourceId}/availability`, { params: { from, to } });

export const getUpcomingBookingsForResource = (resourceId, limit = 10) =>
    api.get(`/v1/bookings/resource/${resourceId}/upcoming`, { params: { limit } });

export const getBookingStats = () =>
    api.get('/v1/bookings/stats');

import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api/v1/resources',
  withCredentials: true,
});

export const getResources = (params = {}) =>
  api.get('', { params });

export const getResourceById = (id) =>
  api.get(`/${id}`);

export const getResourceTypes = () =>
  api.get('/types');

export const getAnalytics = () =>
  api.get('/analytics');

export const createResource = (data) =>
  api.post('', data);

export const updateResource = (id, data) =>
  api.put(`/${id}`, data);

export const updateResourceStatus = (id, status, reason = '') =>
  api.patch(`/${id}/status`, null, { params: { status, reason } });

export const deleteResource = (id) =>
  api.delete(`/${id}`);

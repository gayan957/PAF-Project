import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api/v1/resources',
  withCredentials: true,
});

const buildResourceFormData = (resource, images = []) => {
  const formData = new FormData();
  formData.append(
    'resource',
    new Blob([JSON.stringify(resource)], { type: 'application/json' })
  );
  images.forEach((image) => formData.append('images', image));
  return formData;
};

export const getResources = (params = {}) =>
  api.get('', { params });

export const getResourceById = (id) =>
  api.get(`/${id}`);

export const getResourceTypes = () =>
  api.get('/types');

export const getAnalytics = () =>
  api.get('/analytics');

export const createResource = (data, images = []) =>
  images.length > 0
    ? api.post('', buildResourceFormData(data, images))
    : api.post('', data);

export const updateResource = (id, data, images = []) =>
  images.length > 0
    ? api.put(`/${id}`, buildResourceFormData(data, images))
    : api.put(`/${id}`, data);

export const updateResourceStatus = (id, status, reason = '') =>
  api.patch(`/${id}/status`, null, { params: { status, reason } });

export const deleteResource = (id) =>
  api.delete(`/${id}`);

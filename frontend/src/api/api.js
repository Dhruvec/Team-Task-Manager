import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const projectsApi = {
  getAll: () => api.get('/projects/'),
  create: (data) => api.post('/projects/', data),
  addMember: (id, email) => api.post(`/projects/${id}/add-member`, { email }),
};

export const tasksApi = {
  getAll: () => api.get('/tasks/'),
  create: (data) => api.post('/tasks/', data),
  updateStatus: (id, status) => api.patch(`/tasks/${id}`, { status }),
};

export const dashboardApi = {
  getStats: () => api.get('/dashboard/'),
};

export default api;

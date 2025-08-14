import axios from 'axios';

const baseURL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: `${baseURL}/api/accommodations`,
});

// Attach JWT token if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const createAccommodation = (data) => {
  const isFormData = data instanceof FormData;
  return api.post('/', data, isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {});
};

export const getAccommodations = (params) => api.get('/', { params });
export const getAccommodationById = (id) => api.get(`/${id}`);
export const bookAccommodation = (id, body) => api.post(`/${id}/book`, body);
export const getMyAccommodations = () => api.get('/my-accommodations');

export default api;

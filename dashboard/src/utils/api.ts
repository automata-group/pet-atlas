import axios from 'axios';

const host = window.location.hostname;
const protocol = window.location.protocol;
const API_BASE = host === 'localhost' || host === '127.0.0.1'
  ? 'http://localhost:3000'
  : (host.includes('pet-atlas.com') ? `${protocol}//api.pet-atlas.com` : `${protocol}//${host}/api`);

const api = axios.create({ baseURL: API_BASE });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const isLoginRequest = err.config?.url?.includes('/auth/login');
    const isLoginPage = window.location.pathname === '/login';

    if (err.response?.status === 401 && !isLoginRequest && !isLoginPage) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;

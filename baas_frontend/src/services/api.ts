import axios from 'axios'

const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
const baseURL = rawBaseUrl.replace(/\/+$/, '').replace(/\/api\/?$/, '')

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('@BaaS:token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
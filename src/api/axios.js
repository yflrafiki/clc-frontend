import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.PROD
    ? 'https://clc-backend-zhs6.onrender.com/api'
    : 'http://localhost:5001/api',
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');

  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }

  return req;
});

export default API;
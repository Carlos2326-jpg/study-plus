import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001', // Substitua pela URL do seu back-end
});

// Interceptor para anexar o token automaticamente em cada requisição
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('@App:token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
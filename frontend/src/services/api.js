import axios from 'axios';

const API_URL = 'https://backend-v2a4.onrender.com/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  async register(userData) {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  async login(credentials) {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  }
};

export const stationService = {
  async getAllStations(filters = {}) {
    const response = await api.get('/stations', { params: filters });
    return response.data;
  },

  async getStation(id) {
    const response = await api.get(`/stations/${id}`);
    return response.data;
  },

  async createStation(stationData) {
    const response = await api.post('/stations', stationData);
    return response.data;
  },

  async updateStation(id, stationData) {
    const response = await api.put(`/stations/${id}`, stationData);
    return response.data;
  },

  async deleteStation(id) {
    const response = await api.delete(`/stations/${id}`);
    return response.data;
  }
};

export default api; 
import { defineStore } from 'pinia';
import { authService } from '../services/api';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || null,
    loading: false,
    error: null
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    currentUser: (state) => state.user
  },

  actions: {
    async login(credentials) {
      this.loading = true;
      this.error = null;
      try {
        const data = await authService.login(credentials);
        this.setAuth(data);
        return data;
      } catch (error) {
        this.error = error.response?.data?.message || 'Login failed';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async register(userData) {
      this.loading = true;
      this.error = null;
      try {
        const data = await authService.register(userData);
        this.setAuth(data);
        return data;
      } catch (error) {
        this.error = error.response?.data?.message || 'Registration failed';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    setAuth(data) {
      this.user = data.user;
      this.token = data.token;
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('token', data.token);
    },

    logout() {
      this.user = null;
      this.token = null;
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    },

    async checkAuth() {
      if (this.token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;
      }
    },
  },
}); 
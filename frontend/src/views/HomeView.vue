<script setup>
import { useAuthStore } from '../stores/auth';
import { computed } from 'vue';

const authStore = useAuthStore();
const isAuthenticated = computed(() => authStore.isAuthenticated);
</script>

<template>
  <div class="home-container">
    <div class="welcome-box">
      <h1>Welcome to Charging Station Manager</h1>
      
      <div v-if="isAuthenticated" class="authenticated-content">
        <p>You are logged in. You can now:</p>
        <div class="action-buttons">
          <router-link to="/stations" class="button">View Stations</router-link>
          <router-link to="/map" class="button">View Map</router-link>
        </div>
      </div>
      
      <div v-else class="unauthenticated-content">
        <p>Please log in or register to manage charging stations.</p>
        <div class="action-buttons">
          <router-link to="/login" class="button">Login</router-link>
          <router-link to="/register" class="button is-light">Register</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 200px);
}

.welcome-box {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 600px;
  text-align: center;
}

h1 {
  color: #2c3e50;
  margin-bottom: 2rem;
}

p {
  color: #34495e;
  margin-bottom: 1.5rem;
  font-size: 1.1rem;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.button {
  padding: 0.75rem 1.5rem;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  text-decoration: none;
  cursor: pointer;
  transition: background-color 0.2s;
}

.button:hover {
  background-color: #2980b9;
}

.button.is-light {
  background-color: #ecf0f1;
  color: #2c3e50;
}

.button.is-light:hover {
  background-color: #bdc3c7;
}
</style> 
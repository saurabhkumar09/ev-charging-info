<script setup>
import { useAuthStore } from './stores/auth';
import { computed } from 'vue';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

const isAuthenticated = computed(() => authStore.isAuthenticated);
const currentUser = computed(() => authStore.currentUser);

const logout = async () => {
  authStore.logout();
  router.push('/login');
};
</script>

<template>
  <div class="app">
    <nav>
      <div class="nav-content">
        <router-link to="/" class="navbar-brand">Charging Stations</router-link>
        <div class="nav-links" v-if="isAuthenticated">
          <router-link to="/stations">Stations</router-link>
          <router-link to="/map">Map</router-link>
        </div>
        <div class="nav-links" v-else>
          <router-link to="/login">Login</router-link>
          <router-link to="/register">Register</router-link>
        </div>
        <div v-if="isAuthenticated" class="nav-user">
          <span class="welcome-message">Welcome, {{ currentUser?.name }}</span>
          <button @click="logout" class="logout-button">Logout</button>
        </div>
      </div>
    </nav>
    <main class="container">
      <router-view></router-view>
    </main>
  </div>
</template>

<style>
:root {
  --primary-color: #3498db;
  --secondary-color: #2ecc71;
  --danger-color: #e74c3c;
  --text-color: #2c3e50;
  --background-color: #f8f9fa;
  --card-background: #ffffff;
  --border-radius: 8px;
  --box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  height: 100vh;
  width: 100vw;
  margin: 0;
  padding: 0;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  background-color: var(--background-color);
  color: var(--text-color);
  overflow-x: hidden;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

nav {
  background-color: var(--card-background);
  padding: 1rem 2rem;
  box-shadow: var(--box-shadow);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.nav-content {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.navbar-brand {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--primary-color);
  text-decoration: none;
  margin-right: 2rem;
}

.nav-links {
  display: flex;
  gap: 2rem;
  align-items: center;
}

.nav-user {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.welcome-message {
  color: var(--text-color);
  font-size: 1rem;
  font-weight: 500;
}

.logout-button {
  background-color: var(--danger-color);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: var(--border-radius);
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.logout-button:hover {
  background-color: #c0392b;
}

main {
  flex: 1;
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

@media (max-width: 768px) {
  nav {
    padding: 1rem;
  }

  .nav-content {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .nav-links {
    flex-direction: column;
    width: 100%;
    gap: 0.5rem;
  }

  .nav-user {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  main {
    padding: 1rem;
  }
}
</style>

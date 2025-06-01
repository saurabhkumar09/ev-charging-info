<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const formData = ref({
  name: '',
  email: '',
  password: '',
  confirmPassword: ''
});

const error = ref('');
const loading = ref(false);

const handleSubmit = async () => {
  try {
    if (formData.value.password !== formData.value.confirmPassword) {
      error.value = 'Passwords do not match';
      return;
    }

    loading.value = true;
    error.value = '';
    
    const { confirmPassword, ...registerData } = formData.value;
    await authStore.register(registerData);
    router.push('/');
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to register';
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="auth-container">
    <div class="auth-box">
      <h1>Register</h1>
      
      <form @submit.prevent="handleSubmit" class="auth-form">
        <div class="form-group">
          <label for="name">Name</label>
          <input
            type="text"
            id="name"
            v-model="formData.name"
            required
            placeholder="Enter your name"
          />
        </div>

        <div class="form-group">
          <label for="email">Email</label>
          <input
            type="email"
            id="email"
            v-model="formData.email"
            required
            placeholder="Enter your email"
          />
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <input
            type="password"
            id="password"
            v-model="formData.password"
            required
            placeholder="Enter your password"
            minlength="6"
          />
        </div>

        <div class="form-group">
          <label for="confirmPassword">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            v-model="formData.confirmPassword"
            required
            placeholder="Confirm your password"
            minlength="6"
          />
        </div>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <button type="submit" class="submit-button" :disabled="loading">
          {{ loading ? 'Registering...' : 'Register' }}
        </button>

        <p class="auth-link">
          Already have an account?
          <router-link to="/login">Login here</router-link>
        </p>
      </form>
    </div>
  </div>
</template>

<style scoped>
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 200px);
}

.auth-box {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

h1 {
  color: #2c3e50;
  margin-bottom: 2rem;
  text-align: center;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

label {
  color: #34495e;
  font-weight: 500;
}

input {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

input:focus {
  outline: none;
  border-color: #3498db;
}

.submit-button {
  padding: 0.75rem;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.submit-button:hover:not(:disabled) {
  background-color: #2980b9;
}

.submit-button:disabled {
  background-color: #bdc3c7;
  cursor: not-allowed;
}

.error-message {
  color: #e74c3c;
  text-align: center;
  margin: 0.5rem 0;
}

.auth-link {
  text-align: center;
  margin-top: 1rem;
  color: #34495e;
}

.auth-link a {
  color: #3498db;
  text-decoration: none;
}

.auth-link a:hover {
  text-decoration: underline;
}
</style> 
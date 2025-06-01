import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue')
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue')
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/RegisterView.vue')
    },
    {
      path: '/stations',
      name: 'stations',
      component: () => import('../views/StationsView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/stations/new',
      name: 'new-station',
      component: () => import('../views/StationFormView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/stations/:id/edit',
      name: 'edit-station',
      component: () => import('../views/StationFormView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/map',
      name: 'map',
      component: () => import('../views/MapView.vue'),
      meta: { requiresAuth: true }
    }
  ]
});

// Navigation guard
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'login' });
  } else {
    next();
  }
});

export default router; 
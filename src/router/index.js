import { createRouter, createWebHistory } from 'vue-router';
import AuthView from '../views/AuthView.vue';
import DashboardView from '../views/DashboardView.vue';
import RoomDetailView from '../views/RoomDetailView.vue';

const routes = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/auth',
    name: 'Auth',
    component: AuthView,
    meta: { guestOnly: true }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: DashboardView,
    meta: { requiresAuth: true }
  },
  {
    path: '/rooms/:id',
    name: 'RoomDetail',
    component: RoomDetailView,
    meta: { requiresAuth: true }
  }
];

export const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('fantasy_bets_token');

  if (to.meta.requiresAuth && !token) {
    return next({ name: 'Auth' });
  }

  if (to.meta.guestOnly && token) {
    return next({ name: 'Dashboard' });
  }

  next();
});

export default router;

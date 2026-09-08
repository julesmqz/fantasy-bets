import { ref, computed } from 'vue';
import { api } from '../services/api.js';

const token = ref(localStorage.getItem('fantasy_bets_token') || null);
const storedUser = localStorage.getItem('fantasy_bets_user');
const user = ref(storedUser ? JSON.parse(storedUser) : null);
const isLoading = ref(false);

export function useAuth() {
  const isAuthenticated = computed(() => !!token.value && !!user.value);

  function setSession(newToken, newUser) {
    token.value = newToken;
    user.value = newUser;
    if (newToken) {
      localStorage.setItem('fantasy_bets_token', newToken);
    } else {
      localStorage.removeItem('fantasy_bets_token');
    }
    if (newUser) {
      localStorage.setItem('fantasy_bets_user', JSON.stringify(newUser));
    } else {
      localStorage.removeItem('fantasy_bets_user');
    }
  }

  async function login(email, password) {
    isLoading.value = true;
    try {
      const data = await api.auth.login(email, password);
      setSession(data.token, data.user);
      return data;
    } finally {
      isLoading.value = false;
    }
  }

  async function register(username, email, password) {
    isLoading.value = true;
    try {
      const data = await api.auth.register(username, email, password);
      setSession(data.token, data.user);
      return data;
    } finally {
      isLoading.value = false;
    }
  }

  function logout() {
    setSession(null, null);
  }

  async function checkAuth() {
    if (!token.value) {
      logout();
      return false;
    }
    try {
      const data = await api.auth.me();
      user.value = data.user;
      localStorage.setItem('fantasy_bets_user', JSON.stringify(data.user));
      return true;
    } catch {
      logout();
      return false;
    }
  }

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    checkAuth
  };
}

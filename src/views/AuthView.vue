<template>
  <div class="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950">
    <div class="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl p-8 backdrop-blur-sm">
      <!-- Header / Logo -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-3xl mb-4 shadow-inner">
          ⚽
        </div>
        <h1 class="text-3xl font-extrabold tracking-tight text-white">
          Fantasy Bets
        </h1>
        <p class="text-sm text-slate-400 mt-1">
          Quinielas casuales de la Liga MX entre amigos
        </p>
      </div>

      <!-- Mode Toggle Tabs -->
      <div class="grid grid-cols-2 gap-1 p-1 bg-slate-950 rounded-xl mb-6 border border-slate-800">
        <button
          type="button"
          :class="[
            'py-2 text-sm font-semibold rounded-lg transition-all duration-150',
            isLogin ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
          ]"
          @click="toggleMode(true)"
        >
          Iniciar Sesión
        </button>
        <button
          type="button"
          :class="[
            'py-2 text-sm font-semibold rounded-lg transition-all duration-150',
            !isLogin ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
          ]"
          @click="toggleMode(false)"
        >
          Crear Cuenta
        </button>
      </div>

      <!-- Error Alert -->
      <div
        v-if="errorMessage"
        class="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-start gap-3"
      >
        <span class="text-lg leading-none">⚠️</span>
        <div class="flex-1 font-medium">{{ errorMessage }}</div>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div v-if="!isLogin">
          <label class="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
            Nombre de Usuario
          </label>
          <input
            v-model="form.username"
            type="text"
            required
            placeholder="ej. gibran_mx"
            class="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
          />
        </div>

        <div>
          <label class="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
            Correo Electrónico
          </label>
          <input
            v-model="form.email"
            type="email"
            required
            placeholder="tu@correo.com"
            class="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
          />
        </div>

        <div>
          <label class="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
            Contraseña
          </label>
          <input
            v-model="form.password"
            type="password"
            required
            minlength="6"
            placeholder="••••••••"
            class="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
          />
        </div>

        <button
          type="submit"
          :disabled="isLoading"
          class="w-full mt-2 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 disabled:opacity-50 text-slate-950 font-bold tracking-wide transition duration-150 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
        >
          <span v-if="isLoading" class="animate-spin text-lg">↻</span>
          <span>{{ isLogin ? 'Ingresar a la Quiniela' : 'Registrar y Comenzar' }}</span>
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '../composables/useAuth.js';

const router = useRouter();
const { login, register, isLoading } = useAuth();

const isLogin = ref(true);
const errorMessage = ref('');

const form = reactive({
  username: '',
  email: '',
  password: ''
});

function toggleMode(mode) {
  isLogin.value = mode;
  errorMessage.value = '';
}

async function handleSubmit() {
  errorMessage.value = '';
  try {
    if (isLogin.value) {
      await login(form.email, form.password);
    } else {
      await register(form.username, form.email, form.password);
    }
    router.push('/dashboard');
  } catch (error) {
    errorMessage.value = error.message || 'Ocurrió un error inesperado al autenticar.';
  }
}
</script>

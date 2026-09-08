<template>
  <div class="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
    <router-view />
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useAuth } from './composables/useAuth.js';

const { checkAuth } = useAuth();

onMounted(() => {
  checkAuth();
});
</script>

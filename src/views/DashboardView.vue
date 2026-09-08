<template>
  <div class="min-h-screen bg-slate-950 text-slate-100">
    <!-- Top Navigation Bar -->
    <header class="border-b border-slate-800 bg-slate-900/50 backdrop-blur sticky top-0 z-10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <span class="text-2xl">⚽</span>
          <span class="font-extrabold text-xl tracking-tight text-white">Fantasy Bets</span>
          <span class="text-xs bg-emerald-500/10 text-emerald-400 font-semibold px-2 py-0.5 rounded-full border border-emerald-500/20">Liga MX</span>
        </div>

        <div class="flex items-center gap-4">
          <div class="hidden sm:block text-right">
            <div class="text-sm font-semibold text-white">{{ user?.username }}</div>
            <div class="text-xs text-slate-400">{{ user?.email }}</div>
          </div>
          <button
            @click="handleLogout"
            class="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>
    </header>

    <!-- Main Content Area -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <!-- Quick Action Banner & Forms -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Create Room Card -->
        <div class="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
          <div class="absolute -right-6 -bottom-6 text-7xl text-slate-800/40 select-none pointer-events-none">🏆</div>
          <h2 class="text-lg font-bold text-white flex items-center gap-2 mb-2">
            <span>➕</span> Crear Nueva Sala
          </h2>
          <p class="text-xs text-slate-400 mb-4">
            Genera automáticamente un torneo de 7 jornadas (28 partidos) con 8 equipos de la Liga MX.
          </p>

          <form @submit.prevent="handleCreateRoom" class="space-y-3">
            <div>
              <label class="block text-xs font-semibold text-slate-300 mb-1">Nombre de la Quiniela</label>
              <input
                v-model="createForm.name"
                type="text"
                required
                placeholder="ej. Quiniela de la Oficina"
                class="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-300 mb-1">Capacidad Máxima (Mínimo 2 participantes)</label>
              <input
                v-model.number="createForm.maxUsers"
                type="number"
                min="2"
                max="100"
                required
                class="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
              />
            </div>

            <button
              type="submit"
              :disabled="isCreating"
              class="w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 disabled:opacity-50 text-slate-950 font-bold text-sm tracking-wide transition shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-2"
            >
              <span v-if="isCreating" class="animate-spin text-sm">↻</span>
              <span>Crear Sala y Generar Partidos</span>
            </button>
          </form>
        </div>

        <!-- Join by Code Card -->
        <div class="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between">
          <div class="absolute -right-6 -bottom-6 text-7xl text-slate-800/40 select-none pointer-events-none">🔑</div>
          <div>
            <h2 class="text-lg font-bold text-white flex items-center gap-2 mb-2">
              <span>🎟️</span> Unirse por Código
            </h2>
            <p class="text-xs text-slate-400 mb-4">
              Ingresa el código alfanumérico de 6 dígitos que te compartió el creador de la sala.
            </p>

            <form @submit.prevent="handleJoinRoom" class="space-y-3">
              <div>
                <label class="block text-xs font-semibold text-slate-300 mb-1">Código de Sala (6 caracteres)</label>
                <input
                  v-model="joinCode"
                  type="text"
                  maxlength="6"
                  required
                  placeholder="ej. AB12CD"
                  class="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm uppercase tracking-widest text-center text-white font-mono placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>

              <button
                type="submit"
                :disabled="isJoining"
                class="w-full py-2.5 px-4 rounded-xl bg-blue-500 hover:bg-blue-400 active:bg-blue-600 disabled:opacity-50 text-white font-bold text-sm tracking-wide transition shadow-lg shadow-blue-500/10 flex items-center justify-center gap-2"
              >
                <span v-if="isJoining" class="animate-spin text-sm">↻</span>
                <span>Unirse a la Sala</span>
              </button>
            </form>
          </div>

          <!-- Global feedback banner -->
          <div v-if="actionError" class="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
            {{ actionError }}
          </div>
          <div v-if="actionSuccess" class="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
            {{ actionSuccess }}
          </div>
        </div>
      </div>

      <!-- My Rooms Section -->
      <div>
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-bold text-white flex items-center gap-2">
            <span>🏟️</span> Mis Salas de Quiniela
          </h2>
          <button
            @click="loadMyRooms"
            class="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition"
          >
            <span>🔄 Actualizar</span>
          </button>
        </div>

        <div v-if="isLoadingRooms" class="text-center py-16 text-slate-400">
          <span class="inline-block animate-spin text-3xl mb-2">↻</span>
          <p class="text-sm">Cargando salas...</p>
        </div>

        <div v-else-if="rooms.length === 0" class="text-center py-16 bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl p-8">
          <span class="text-5xl block mb-3">🎲</span>
          <h3 class="text-base font-semibold text-white">No perteneces a ninguna sala todavía</h3>
          <p class="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Crea tu propia sala para competir con tus amigos o ingresa con un código compartido.
          </p>
        </div>

        <!-- Room Cards Grid -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="room in rooms"
            :key="room.id"
            class="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-lg flex flex-col justify-between transition hover:-translate-y-0.5"
          >
            <div>
              <div class="flex items-start justify-between gap-2 mb-3">
                <h3 class="font-bold text-base text-white truncate">{{ room.name }}</h3>
                <span
                  :class="[
                    'text-xs font-semibold px-2.5 py-0.5 rounded-full border',
                    room.status === 'open'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : 'bg-slate-700/30 text-slate-400 border-slate-700'
                  ]"
                >
                  {{ room.status === 'open' ? 'En Juego' : 'Finalizada' }}
                </span>
              </div>

              <!-- Badges and Details -->
              <div class="flex items-center gap-2 mb-4">
                <span
                  :class="[
                    'text-xs font-medium px-2 py-0.5 rounded-md',
                    room.role === 'creator'
                      ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                      : 'bg-slate-800 text-slate-300 border border-slate-700'
                  ]"
                >
                  {{ room.role === 'creator' ? '👑 Creador' : '👤 Participante' }}
                </span>

                <span class="text-xs text-slate-400 flex items-center gap-1">
                  👥 {{ room.member_count }} / {{ room.maxUsers }} participantes
                </span>
              </div>

              <!-- Code box -->
              <div class="bg-slate-950 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between mb-4">
                <div>
                  <span class="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">Código de acceso</span>
                  <span class="font-mono font-bold text-emerald-400 text-sm tracking-wider">{{ room.code }}</span>
                </div>
                <button
                  @click="copyCode(room.code)"
                  class="text-xs px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                  title="Copiar código al portapapeles"
                >
                  {{ copiedCode === room.code ? '¡Copiado!' : 'Copiar' }}
                </button>
              </div>
            </div>

            <router-link
              :to="`/rooms/${room.id}`"
              class="w-full py-2 px-4 rounded-xl bg-slate-800 hover:bg-emerald-600 hover:text-white text-slate-200 text-center font-semibold text-sm transition"
            >
              Entrar a la Sala →
            </router-link>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '../composables/useAuth.js';
import { api } from '../services/api.js';

const router = useRouter();
const { user, logout } = useAuth();

const rooms = ref([]);
const isLoadingRooms = ref(false);
const isCreating = ref(false);
const isJoining = ref(false);

const actionError = ref('');
const actionSuccess = ref('');
const copiedCode = ref('');

const createForm = reactive({
  name: '',
  maxUsers: 4
});

const joinCode = ref('');

async function loadMyRooms() {
  isLoadingRooms.value = true;
  try {
    const data = await api.rooms.getMyRooms();
    rooms.value = data.rooms || [];
  } catch (error) {
    actionError.value = error.message;
  } finally {
    isLoadingRooms.value = false;
  }
}

async function handleCreateRoom() {
  actionError.value = '';
  actionSuccess.value = '';
  isCreating.value = true;
  try {
    const res = await api.rooms.create(createForm.name, createForm.maxUsers);
    actionSuccess.value = `¡Sala "${res.room.name}" creada con éxito! Código: ${res.room.code}`;
    createForm.name = '';
    await loadMyRooms();
  } catch (error) {
    actionError.value = error.message;
  } finally {
    isCreating.value = false;
  }
}

async function handleJoinRoom() {
  actionError.value = '';
  actionSuccess.value = '';
  isJoining.value = true;
  try {
    const res = await api.rooms.join(joinCode.value);
    actionSuccess.value = `Te has unido con éxito a "${res.room.name}"`;
    joinCode.value = '';
    await loadMyRooms();
  } catch (error) {
    actionError.value = error.message;
  } finally {
    isJoining.value = false;
  }
}

function copyCode(code) {
  navigator.clipboard?.writeText(code);
  copiedCode.value = code;
  setTimeout(() => {
    if (copiedCode.value === code) {
      copiedCode.value = '';
    }
  }, 2000);
}

function handleLogout() {
  logout();
  router.push('/auth');
}

onMounted(() => {
  loadMyRooms();
});
</script>

<template>
  <div class="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
    <!-- Top Bar -->
    <header class="border-b border-slate-800 bg-slate-900/60 backdrop-blur sticky top-0 z-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <router-link
            to="/dashboard"
            class="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition flex items-center gap-1.5"
          >
            ← Volver al Dashboard
          </router-link>
          <div class="h-5 w-px bg-slate-800"></div>
          <span class="font-bold text-white text-lg truncate max-w-[200px] sm:max-w-xs">{{ room?.name }}</span>
        </div>

        <div class="flex items-center gap-3">
          <!-- Simulation button for Creator -->
          <button
            v-if="isCreator && room?.status === 'open'"
            @click="showSimulateModal = true"
            :disabled="isSimulating"
            class="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 active:from-amber-600 active:to-orange-600 text-slate-950 font-bold text-xs sm:text-sm tracking-wide shadow-lg shadow-orange-500/20 flex items-center gap-2 transition"
          >
            <span v-if="isSimulating" class="animate-spin">↻</span>
            <span>⚡ Simular y Cerrar Quiniela</span>
          </button>
        </div>
      </div>
    </header>

    <div v-if="isLoading" class="flex-1 flex items-center justify-center py-20 text-slate-400">
      <div class="text-center">
        <span class="inline-block animate-spin text-4xl mb-3">↻</span>
        <p class="text-sm">Cargando detalles del torneo...</p>
      </div>
    </div>

    <!-- Main Tournament Content -->
    <main v-else class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1 space-y-6">
      <!-- Error & Success alerts -->
      <div v-if="alertMessage" class="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
        {{ alertMessage }}
      </div>
      <div v-if="successMessage" class="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm">
        {{ successMessage }}
      </div>

      <!-- Room Header Hero -->
      <div class="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div class="space-y-1">
          <div class="flex items-center gap-2">
            <h1 class="text-2xl font-extrabold text-white">{{ room?.name }}</h1>
            <span
              :class="[
                'text-xs font-semibold px-2.5 py-0.5 rounded-full border',
                room?.status === 'open'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
              ]"
            >
              {{ room?.status === 'open' ? '🟢 En Juego (Apuestas Abiertas)' : '🏁 Finalizada' }}
            </span>
          </div>
          <p class="text-xs text-slate-400">
            Formato Round-Robin Oficial: 8 Equipos • 7 Jornadas • 28 Partidos en total (1 pt por acierto)
          </p>
        </div>

        <!-- Meta Info Pills -->
        <div class="flex flex-wrap items-center gap-3">
          <!-- Copy Code Pill -->
          <div class="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 flex items-center gap-2">
            <span class="text-xs text-slate-500 uppercase font-semibold">Código:</span>
            <span class="font-mono font-bold text-emerald-400 text-sm tracking-widest">{{ room?.code }}</span>
            <button
              @click="copyCode(room?.code)"
              class="text-xs text-slate-400 hover:text-white transition underline"
            >
              {{ copiedCode ? '¡Copiado!' : 'Copiar' }}
            </button>
          </div>

          <!-- Capacity Pill -->
          <div class="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300">
            👥 <span class="font-bold text-white">{{ room?.memberCount }}</span> / {{ room?.maxUsers }} cupos
          </div>

          <!-- Role Pill -->
          <div class="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs">
            <span v-if="isCreator" class="text-amber-400 font-semibold">👑 Eres el Creador</span>
            <span v-else class="text-slate-300 font-medium">👤 Participante</span>
          </div>
        </div>
      </div>

      <!-- Layout: Matches (Left / Main) + Leaderboard (Right / Sidebar) -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Main Column: Jornadas & Matches -->
        <div class="lg:col-span-2 space-y-4">
          <!-- Round Selector Tabs -->
          <div class="bg-slate-900 border border-slate-800 rounded-2xl p-2 flex items-center justify-between overflow-x-auto gap-1">
            <button
              v-for="r in 7"
              :key="r"
              @click="activeRound = r"
              :class="[
                'flex-1 min-w-[70px] py-2 px-3 rounded-xl text-xs font-bold transition flex flex-col items-center gap-0.5',
                activeRound === r
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              ]"
            >
              <span>Jornada</span>
              <span class="text-base leading-none">{{ r }}</span>
            </button>
          </div>

          <!-- Matches of Active Round -->
          <div class="space-y-3">
            <div
              v-for="match in roundMatches"
              :key="match.id"
              class="bg-slate-900/80 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-4 shadow-lg transition"
            >
              <div class="flex items-center justify-between text-xs text-slate-400 mb-3 border-b border-slate-800/80 pb-2">
                <span>Partido #{{ match.id }} • Jornada {{ match.round }}</span>
                <span v-if="match.status === 'finished'" class="text-emerald-400 font-semibold">
                  ✓ Terminado
                </span>
                <span v-else class="text-amber-400/80 font-medium">
                  ⏳ Pendiente
                </span>
              </div>

              <!-- Match Teams Grid -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                <!-- Home Team Button / Box -->
                <button
                  type="button"
                  :disabled="room?.status === 'completed' || isSavingBet === match.id"
                  @click="makePrediction(match, match.homeTeam)"
                  :class="[
                    'p-3.5 rounded-xl border text-left transition flex items-center justify-between gap-2 relative overflow-hidden',
                    getUserPrediction(match.id) === match.homeTeam
                      ? 'bg-emerald-950/40 border-emerald-500 text-emerald-200 ring-1 ring-emerald-500'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700',
                    room?.status === 'open' ? 'cursor-pointer active:scale-[0.98]' : 'cursor-default'
                  ]"
                >
                  <div class="flex items-center gap-2.5">
                    <span class="text-xl">🛡️</span>
                    <div>
                      <div class="font-bold text-sm text-white">{{ match.homeTeam }}</div>
                      <span class="text-[10px] text-slate-400 uppercase tracking-wider">Local</span>
                    </div>
                  </div>

                  <!-- Badges for winner or user choice -->
                  <div class="flex items-center gap-1.5">
                    <span
                      v-if="match.winner === match.homeTeam"
                      class="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded border border-amber-500/30"
                    >
                      🏆 GANADOR
                    </span>
                    <span
                      v-if="getUserPrediction(match.id) === match.homeTeam"
                      class="text-xs font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded"
                    >
                      Tu Voto ✓
                    </span>
                  </div>
                </button>

                <!-- Away Team Button / Box -->
                <button
                  type="button"
                  :disabled="room?.status === 'completed' || isSavingBet === match.id"
                  @click="makePrediction(match, match.awayTeam)"
                  :class="[
                    'p-3.5 rounded-xl border text-left transition flex items-center justify-between gap-2 relative overflow-hidden',
                    getUserPrediction(match.id) === match.awayTeam
                      ? 'bg-emerald-950/40 border-emerald-500 text-emerald-200 ring-1 ring-emerald-500'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700',
                    room?.status === 'open' ? 'cursor-pointer active:scale-[0.98]' : 'cursor-default'
                  ]"
                >
                  <div class="flex items-center gap-2.5">
                    <span class="text-xl">⚔️</span>
                    <div>
                      <div class="font-bold text-sm text-white">{{ match.awayTeam }}</div>
                      <span class="text-[10px] text-slate-400 uppercase tracking-wider">Visitante</span>
                    </div>
                  </div>

                  <!-- Badges for winner or user choice -->
                  <div class="flex items-center gap-1.5">
                    <span
                      v-if="match.winner === match.awayTeam"
                      class="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded border border-amber-500/30"
                    >
                      🏆 GANADOR
                    </span>
                    <span
                      v-if="getUserPrediction(match.id) === match.awayTeam"
                      class="text-xs font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded"
                    >
                      Tu Voto ✓
                    </span>
                  </div>
                </button>
              </div>

              <!-- Bet Result Indicator (if room completed) -->
              <div
                v-if="room?.status === 'completed'"
                class="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs"
              >
                <div v-if="getUserPrediction(match.id)">
                  <span
                    v-if="getUserPrediction(match.id) === match.winner"
                    class="text-emerald-400 font-bold flex items-center gap-1"
                  >
                    <span>🎯 ¡Acierto!</span>
                    <span class="bg-emerald-500/20 px-1.5 py-0.5 rounded text-[10px]">+1 Punto</span>
                  </span>
                  <span v-else class="text-rose-400 font-medium flex items-center gap-1">
                    <span>❌ No acertaste</span>
                    <span class="bg-rose-500/20 px-1.5 py-0.5 rounded text-[10px]">0 Pts</span>
                  </span>
                </div>
                <div v-else class="text-slate-500 italic">
                  No registraste pronóstico para este encuentro
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar Column: Leaderboard -->
        <div class="space-y-4">
          <div class="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl sticky top-24">
            <div class="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
              <h2 class="text-base font-bold text-white flex items-center gap-2">
                <span>🏆</span> Tabla de Posiciones
              </h2>
              <span class="text-xs text-slate-400">Total Jornadas: 7</span>
            </div>

            <!-- Leaderboard list -->
            <div v-if="leaderboard.length === 0" class="text-center py-8 text-slate-500 text-xs">
              No hay participantes registrados.
            </div>
            <div v-else class="space-y-2">
              <div
                v-for="item in leaderboard"
                :key="item.userId"
                :class="[
                  'p-3 rounded-xl flex items-center justify-between border transition',
                  item.userId === user?.id
                    ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                    : 'bg-slate-950/50 border-slate-800/60 text-slate-300'
                ]"
              >
                <div class="flex items-center gap-3">
                  <!-- Rank Badge -->
                  <div
                    :class="[
                      'w-7 h-7 rounded-lg flex items-center justify-center font-extrabold text-xs shadow-inner',
                      item.rank === 1
                        ? 'bg-amber-400 text-slate-950 ring-2 ring-amber-300'
                        : item.rank === 2
                        ? 'bg-slate-300 text-slate-950'
                        : item.rank === 3
                        ? 'bg-amber-700 text-white'
                        : 'bg-slate-800 text-slate-400'
                    ]"
                  >
                    {{ item.rank === 1 ? '🥇' : item.rank === 2 ? '🥈' : item.rank === 3 ? '🥉' : item.rank }}
                  </div>

                  <div>
                    <div class="font-bold text-sm text-white flex items-center gap-1.5">
                      <span>{{ item.username }}</span>
                      <span v-if="item.userId === user?.id" class="text-[10px] text-emerald-400 font-normal">
                        (Tú)
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Points score -->
                <div class="text-right">
                  <span class="text-base font-extrabold text-white">{{ item.score }}</span>
                  <span class="text-[10px] text-slate-400 ml-1">pts</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Confirmation Modal for Simulation -->
    <div
      v-if="showSimulateModal"
      class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div class="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
        <div class="text-center">
          <span class="text-5xl block mb-2">⚡</span>
          <h3 class="text-lg font-extrabold text-white">¿Simular Quiniela y Cerrar Sala?</h3>
          <p class="text-xs text-slate-400 mt-2 leading-relaxed">
            Esta acción ejecutará en una sola transacción atómica la resolución de los 28 partidos, calculará automáticamente los aciertos de todos los miembros y cerrará las apuestas permanentemente.
          </p>
        </div>

        <div class="flex items-center gap-3 pt-2">
          <button
            type="button"
            @click="showSimulateModal = false"
            class="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition"
          >
            Cancelar
          </button>
          <button
            type="button"
            :disabled="isSimulating"
            @click="confirmSimulation"
            class="flex-1 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition"
          >
            <span v-if="isSimulating" class="animate-spin">↻</span>
            <span>Confirmar Simulación</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useAuth } from '../composables/useAuth.js';
import { api } from '../services/api.js';

const route = useRoute();
const { user } = useAuth();

const roomId = computed(() => route.params.id);

const room = ref(null);
const matches = ref([]);
const myBets = ref([]);
const leaderboard = ref([]);
const activeRound = ref(1);

const isLoading = ref(true);
const isSimulating = ref(false);
const isSavingBet = ref(null);
const showSimulateModal = ref(false);

const alertMessage = ref('');
const successMessage = ref('');
const copiedCode = ref(false);

const isCreator = computed(() => {
  return room.value?.creatorId === user.value?.id;
});

const roundMatches = computed(() => {
  return matches.value.filter((m) => m.round === activeRound.value);
});

function getUserPrediction(matchId) {
  const bet = myBets.value.find((b) => b.matchId === matchId);
  return bet?.predictedWinner || null;
}

async function loadRoomData() {
  isLoading.value = true;
  try {
    const [roomRes, matchesRes, betsRes, lbRes] = await Promise.all([
      api.rooms.getById(roomId.value),
      api.rooms.getMatches(roomId.value),
      api.bets.getMyBets(roomId.value),
      api.bets.getLeaderboard(roomId.value)
    ]);

    room.value = roomRes.room;
    matches.value = matchesRes.matches || [];
    myBets.value = betsRes.bets || [];
    leaderboard.value = lbRes.leaderboard || [];
  } catch (error) {
    alertMessage.value = error.message;
  } finally {
    isLoading.value = false;
  }
}

async function makePrediction(match, predictedWinner) {
  if (room.value?.status !== 'open') return;

  isSavingBet.value = match.id;
  alertMessage.value = '';
  try {
    const res = await api.bets.placeBet(roomId.value, match.id, predictedWinner);
    // Update local bets state
    const index = myBets.value.findIndex((b) => b.matchId === match.id);
    if (index !== -1) {
      myBets.value[index] = res.bet;
    } else {
      myBets.value.push(res.bet);
    }
  } catch (error) {
    alertMessage.value = error.message;
  } finally {
    isSavingBet.value = null;
  }
}

async function confirmSimulation() {
  isSimulating.value = true;
  alertMessage.value = '';
  try {
    await api.bets.simulate(roomId.value);
    showSimulateModal.value = false;
    successMessage.value = '¡Quiniela simulada y cerrada exitosamente! Revisa los resultados y el leaderboard.';
    await loadRoomData();
  } catch (error) {
    alertMessage.value = error.message;
  } finally {
    isSimulating.value = false;
  }
}

function copyCode(code) {
  if (!code) return;
  navigator.clipboard?.writeText(code);
  copiedCode.value = true;
  setTimeout(() => {
    copiedCode.value = false;
  }, 2000);
}

onMounted(() => {
  loadRoomData();
});
</script>

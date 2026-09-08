const API_BASE = '/api';

function getAuthHeaders() {
  const token = localStorage.getItem('fantasy_bets_token');
  const headers = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = { ...getAuthHeaders(), ...options.headers };
  const response = await fetch(url, { ...options, headers });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const errorMsg = data.error || data.message || `Error ${response.status}: ${response.statusText}`;
    const error = new Error(errorMsg);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  auth: {
    register: (username, email, password) =>
      request('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ username, email, password })
      }),
    login: (email, password) =>
      request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      }),
    me: () => request('/auth/me')
  },
  rooms: {
    create: (name, maxUsers) =>
      request('/rooms', {
        method: 'POST',
        body: JSON.stringify({ name, max_users: maxUsers })
      }),
    join: (code) =>
      request('/rooms/join', {
        method: 'POST',
        body: JSON.stringify({ code })
      }),
    getMyRooms: () => request('/rooms/my-rooms'),
    getById: (id) => request(`/rooms/${id}`),
    getMatches: (id) => request(`/rooms/${id}/matches`)
  },
  bets: {
    placeBet: (roomId, matchId, predictedWinner) =>
      request(`/rooms/${roomId}/bets`, {
        method: 'POST',
        body: JSON.stringify({ match_id: matchId, predicted_winner: predictedWinner })
      }),
    getMyBets: (roomId) => request(`/rooms/${roomId}/bets/me`),
    simulate: (roomId) =>
      request(`/rooms/${roomId}/simulate`, {
        method: 'POST'
      }),
    getLeaderboard: (roomId) => request(`/rooms/${roomId}/leaderboard`)
  }
};

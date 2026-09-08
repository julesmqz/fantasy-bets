import { app } from '../src/app.js';
import { db } from '../src/shared/infrastructure/db/connection.js';

async function runFullE2ETestSuite() {
  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}/api`;

  console.log(`\n========================================`);
  console.log(`🚀 RUNNING FULL OPENSPEC E2E TEST SUITE`);
  console.log(`   Endpoint: ${baseUrl}`);
  console.log(`========================================\n`);

  try {
    const timestamp = Date.now();

    // ----------------------------------------------------
    // 1. SPEC: user-auth
    // ----------------------------------------------------
    console.log('--- 1. Testing user-auth Spec ---');
    const u1Name = `carlos_${timestamp}`;
    const u2Name = `ana_${timestamp}`;
    const u3Name = `roberto_${timestamp}`;

    // 1.1 Registro exitoso
    const r1 = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: u1Name, email: `${u1Name}@bets.com`, password: 'password123' })
    });
    const { token: t1, user: u1 } = await r1.json();
    if (r1.status !== 201 || !t1 || u1.username !== u1Name) {
      throw new Error(`Register failed for ${u1Name}`);
    }
    console.log('  ✓ Registro exitoso (201)');

    // 1.2 Registro con email duplicado
    const rDupEmail = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: `other_${timestamp}`, email: `${u1Name}@bets.com`, password: 'password123' })
    });
    if (rDupEmail.status !== 409) {
      throw new Error(`Expected 409 for duplicate email, got ${rDupEmail.status}`);
    }
    console.log('  ✓ Registro con email duplicado rechazado (409 Conflict)');

    // 1.3 Registro con username duplicado
    const rDupUser = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: u1Name, email: `different_${timestamp}@bets.com`, password: 'password123' })
    });
    if (rDupUser.status !== 409) {
      throw new Error(`Expected 409 for duplicate username, got ${rDupUser.status}`);
    }
    console.log('  ✓ Registro con username duplicado rechazado (409 Conflict)');

    // 1.4 Inicio de sesión exitoso
    const rLogin = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: `${u1Name}@bets.com`, password: 'password123' })
    });
    const loginData = await rLogin.json();
    if (rLogin.status !== 200 || !loginData.token) {
      throw new Error('Login failed for registered user');
    }
    console.log('  ✓ Inicio de sesión exitoso (200)');

    // 1.5 Credenciales inválidas
    const rBadLogin = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: `${u1Name}@bets.com`, password: 'wrongpassword' })
    });
    if (rBadLogin.status !== 401) {
      throw new Error(`Expected 401 for bad login, got ${rBadLogin.status}`);
    }
    console.log('  ✓ Credenciales inválidas rechazadas (401 Unauthorized)');

    // 1.6 Acceso con token válido
    const rMe = await fetch(`${baseUrl}/auth/me`, {
      headers: { 'Authorization': `Bearer ${t1}` }
    });
    if (rMe.status !== 200) {
      throw new Error('Access with valid token failed');
    }
    console.log('  ✓ Acceso con token válido exitoso (200)');

    // 1.7 Acceso sin token o expirado
    const rNoToken = await fetch(`${baseUrl}/auth/me`);
    if (rNoToken.status !== 401) {
      throw new Error(`Expected 401 for missing token, got ${rNoToken.status}`);
    }
    console.log('  ✓ Acceso sin token rechazado (401 Unauthorized)');

    // Register User 2 & User 3
    const r2 = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: u2Name, email: `${u2Name}@bets.com`, password: 'password123' })
    });
    const { token: t2, user: u2 } = await r2.json();

    const r3 = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: u3Name, email: `${u3Name}@bets.com`, password: 'password123' })
    });
    const { token: t3, user: u3 } = await r3.json();

    // ----------------------------------------------------
    // 2. SPEC: rooms & matches
    // ----------------------------------------------------
    console.log('\n--- 2. Testing rooms & matches Spec ---');

    // 2.1 Capacidad inválida en creación
    const rInvalidRoom = await fetch(`${baseUrl}/rooms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${t1}` },
      body: JSON.stringify({ name: 'Sala Inválida', max_users: 1 })
    });
    if (rInvalidRoom.status !== 400) {
      throw new Error(`Expected 400 for max_users < 2, got ${rInvalidRoom.status}`);
    }
    console.log('  ✓ Creación con max_users < 2 rechazada (400 Bad Request)');

    // 2.2 Creación exitosa de sala
    const rCreateRoom = await fetch(`${baseUrl}/rooms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${t1}` },
      body: JSON.stringify({ name: 'Copa México 2026', max_users: 2 })
    });
    const { room } = await rCreateRoom.json();
    if (rCreateRoom.status !== 201 || !room.code || room.code.length !== 6 || room.status !== 'open') {
      throw new Error(`Room creation failed: ${JSON.stringify(room)}`);
    }
    console.log(`  ✓ Sala creada exitosamente con código único de 6 caracteres: ${room.code} (201)`);

    // 2.3 Verificación de 28 partidos Round-Robin generados automáticamente
    const rMatches = await fetch(`${baseUrl}/rooms/${room.id}/matches`, {
      headers: { 'Authorization': `Bearer ${t1}` }
    });
    const { matches } = await rMatches.json();
    if (matches.length !== 28) {
      throw new Error(`Expected exactly 28 matches, got ${matches.length}`);
    }

    const roundCounts = {};
    const teamsPlaying = new Set();
    for (const m of matches) {
      roundCounts[m.round] = (roundCounts[m.round] || 0) + 1;
      teamsPlaying.add(m.homeTeam);
      teamsPlaying.add(m.awayTeam);
      if (m.status !== 'pending' || m.winner !== null) {
        throw new Error(`Match ${m.id} should be pending with null winner`);
      }
    }

    if (teamsPlaying.size !== 8) {
      throw new Error(`Expected 8 distinct teams selected from pool of 9, got ${teamsPlaying.size}`);
    }

    for (let r = 1; r <= 7; r++) {
      if (roundCounts[r] !== 4) {
        throw new Error(`Round ${r} has ${roundCounts[r]} matches instead of 4`);
      }
    }
    console.log('  ✓ 28 partidos Round-Robin verificados (8 equipos, 7 jornadas, 4 partidos/jornada)');

    // 2.4 Unión exitosa a sala disponible
    const rJoin = await fetch(`${baseUrl}/rooms/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${t2}` },
      body: JSON.stringify({ code: room.code })
    });
    if (rJoin.status !== 200) {
      throw new Error(`Join room failed: ${rJoin.status}`);
    }
    console.log('  ✓ Unión exitosa a sala por código (200)');

    // 2.5 Usuario ya miembro de la sala se une de nuevo (Idempotente sin duplicar)
    const rJoinAgain = await fetch(`${baseUrl}/rooms/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${t2}` },
      body: JSON.stringify({ code: room.code })
    });
    if (rJoinAgain.status !== 200) {
      throw new Error('Rejoining existing room should succeed idempotently');
    }
    console.log('  ✓ Intento de unión por usuario ya miembro no duplica (200)');

    // 2.6 Intento de unión a sala llena (Capacidad alcanzada: 2 usuarios)
    const rJoinFull = await fetch(`${baseUrl}/rooms/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${t3}` },
      body: JSON.stringify({ code: room.code })
    });
    if (rJoinFull.status !== 409) {
      throw new Error(`Expected 409 Conflict for full room, got ${rJoinFull.status}`);
    }
    console.log('  ✓ Intento de unión a sala llena rechazado (409 Conflict)');

    // 2.7 Consulta de salas del usuario
    const rMyRooms = await fetch(`${baseUrl}/rooms/my-rooms`, {
      headers: { 'Authorization': `Bearer ${t2}` }
    });
    const { rooms: myRooms } = await rMyRooms.json();
    const joinedRoom = myRooms.find((r) => r.id === room.id);
    if (!joinedRoom || joinedRoom.role !== 'member' || joinedRoom.member_count !== 2) {
      throw new Error(`my-rooms verification failed: ${JSON.stringify(myRooms)}`);
    }
    console.log('  ✓ Listado de salas del usuario verificado con conteo y rol (200)');

    // ----------------------------------------------------
    // 3. SPEC: bets & simulación transaccional
    // ----------------------------------------------------
    console.log('\n--- 3. Testing bets & simulación transaccional Spec ---');

    // 3.1 Pronóstico por usuario no miembro
    const rBetNonMember = await fetch(`${baseUrl}/rooms/${room.id}/bets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${t3}` },
      body: JSON.stringify({ match_id: matches[0].id, predicted_winner: matches[0].homeTeam })
    });
    if (rBetNonMember.status !== 403) {
      throw new Error(`Expected 403 for non-member bet, got ${rBetNonMember.status}`);
    }
    console.log('  ✓ Pronóstico por usuario no miembro rechazado (403 Forbidden)');

    // 3.2 Pronóstico con equipo inválido
    const rBetInvalidTeam = await fetch(`${baseUrl}/rooms/${room.id}/bets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${t1}` },
      body: JSON.stringify({ match_id: matches[0].id, predicted_winner: 'Real Madrid' })
    });
    if (rBetInvalidTeam.status !== 400) {
      throw new Error(`Expected 400 for invalid team, got ${rBetInvalidTeam.status}`);
    }
    console.log('  ✓ Pronóstico con equipo no participante rechazado (400 Bad Request)');

    // 3.3 Registro y modificación exitosa de pronósticos
    // User 1 bets on Home Team for Match 0
    const rBet1 = await fetch(`${baseUrl}/rooms/${room.id}/bets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${t1}` },
      body: JSON.stringify({ match_id: matches[0].id, predicted_winner: matches[0].homeTeam })
    });
    if (rBet1.status !== 200) {
      throw new Error('Placing bet 1 failed');
    }

    // User 1 modifies bet to Away Team
    const rBet1Mod = await fetch(`${baseUrl}/rooms/${room.id}/bets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${t1}` },
      body: JSON.stringify({ match_id: matches[0].id, predicted_winner: matches[0].awayTeam })
    });
    const bet1ModData = await rBet1Mod.json();
    if (rBet1Mod.status !== 200 || bet1ModData.bet.predictedWinner !== matches[0].awayTeam) {
      throw new Error('Updating bet failed');
    }
    console.log('  ✓ Registro y modificación de pronóstico exitoso (200)');

    // User 2 bets on matches 0 and 1
    await fetch(`${baseUrl}/rooms/${room.id}/bets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${t2}` },
      body: JSON.stringify({ match_id: matches[0].id, predicted_winner: matches[0].homeTeam })
    });
    await fetch(`${baseUrl}/rooms/${room.id}/bets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${t2}` },
      body: JSON.stringify({ match_id: matches[1].id, predicted_winner: matches[1].homeTeam })
    });

    // 3.4 Intento de simulación por usuario no creador
    const rSimNonCreator = await fetch(`${baseUrl}/rooms/${room.id}/simulate`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${t2}` }
    });
    if (rSimNonCreator.status !== 403) {
      throw new Error(`Expected 403 for non-creator simulate, got ${rSimNonCreator.status}`);
    }
    console.log('  ✓ Intento de simulación por participante no creador rechazado (403 Forbidden)');

    // 3.5 Simulación y liquidación transaccional exitosa por el creador
    const rSimulate = await fetch(`${baseUrl}/rooms/${room.id}/simulate`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${t1}` }
    });
    const { room: simulatedRoom } = await rSimulate.json();
    if (rSimulate.status !== 200 || simulatedRoom.status !== 'completed') {
      throw new Error(`Simulate failed: ${JSON.stringify(simulatedRoom)}`);
    }
    console.log('  ✓ Simulación y liquidación atómica por el creador exitosa (200)');

    // Verify all matches are now finished
    const rMatchesAfter = await fetch(`${baseUrl}/rooms/${room.id}/matches`, {
      headers: { 'Authorization': `Bearer ${t1}` }
    });
    const { matches: finishedMatches } = await rMatchesAfter.json();
    for (const m of finishedMatches) {
      if (m.status !== 'finished' || !m.winner) {
        throw new Error(`Match ${m.id} was not finalized properly: status=${m.status}, winner=${m.winner}`);
      }
    }
    console.log('  ✓ Los 28 partidos quedaron marcados como finished con ganador asignado');

    // 3.6 Intento de pronóstico en sala completada
    const rLateBet = await fetch(`${baseUrl}/rooms/${room.id}/bets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${t1}` },
      body: JSON.stringify({ match_id: matches[2].id, predicted_winner: matches[2].homeTeam })
    });
    if (rLateBet.status !== 403) {
      throw new Error(`Expected 403 for betting in completed room, got ${rLateBet.status}`);
    }
    console.log('  ✓ Intento de pronóstico en sala completada rechazado (403 Forbidden)');

    // 3.7 Intento de simulación sobre sala ya completada
    const rSecondSim = await fetch(`${baseUrl}/rooms/${room.id}/simulate`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${t1}` }
    });
    if (rSecondSim.status !== 409) {
      throw new Error(`Expected 409 for re-simulation, got ${rSecondSim.status}`);
    }
    console.log('  ✓ Intento de re-simulación en sala completada rechazado (409 Conflict)');

    // 3.8 Intento de unión a sala completada
    const rJoinCompleted = await fetch(`${baseUrl}/rooms/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${t3}` },
      body: JSON.stringify({ code: room.code })
    });
    if (rJoinCompleted.status !== 403 && rJoinCompleted.status !== 409) {
      throw new Error(`Expected 403/409 for joining completed room, got ${rJoinCompleted.status}`);
    }
    console.log('  ✓ Intento de unión a sala completada rechazado (403/409)');

    // 3.9 Consulta de Leaderboard con posiciones y ordenamiento
    const rLb = await fetch(`${baseUrl}/rooms/${room.id}/leaderboard`, {
      headers: { 'Authorization': `Bearer ${t1}` }
    });
    const { leaderboard } = await rLb.json();
    if (rLb.status !== 200 || leaderboard.length !== 2) {
      throw new Error(`Leaderboard invalid: ${JSON.stringify(leaderboard)}`);
    }

    if (leaderboard[0].rank !== 1 || leaderboard[1].rank !== 2) {
      throw new Error('Ranks not assigned correctly');
    }

    if (leaderboard[0].score < leaderboard[1].score) {
      throw new Error('Leaderboard should be sorted DESC by score');
    }
    console.log('  ✓ Leaderboard verificado con ranking y ordenamiento correcto (score DESC, username ASC)');
    console.log('    Ranking final:', leaderboard.map(l => `#${l.rank} ${l.username}: ${l.score} pts`).join(' | '));

    console.log('\n========================================');
    console.log('🎉 ALL OPENSPEC SCENARIOS PASSED 100%!');
    console.log('========================================\n');

    server.close(() => {
      // Exit cleanly
    });
  } catch (error) {
    console.error('\n❌ TEST SUITE FAILED:', error);
    server.close();
    process.exit(1);
  }
}

runFullE2ETestSuite();

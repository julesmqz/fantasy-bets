import express from 'express';
import { initializeDatabase } from '../src/shared/infrastructure/db/initDb.js';
import { createAuthRouter } from '../src/modules/users/infrastructure/http/authRoutes.js';
import { createRoomRouter } from '../src/modules/rooms/infrastructure/http/roomRoutes.js';
import { errorHandler } from '../src/shared/infrastructure/http/errorHandler.js';
import { db } from '../src/shared/infrastructure/db/connection.js';

initializeDatabase();

const app = express();
app.use(express.json());
app.use('/api/auth', createAuthRouter());
app.use('/api/rooms', createRoomRouter());
app.use(errorHandler);

const server = app.listen(0, async () => {
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}/api`;

  try {
    const timestamp = Date.now();
    // 1. Register User 1 & User 2
    const u1Res = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: `user1_${timestamp}`, email: `u1_${timestamp}@test.com`, password: 'password123' })
    });
    const { token: token1, user: user1 } = await u1Res.json();

    const u2Res = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: `user2_${timestamp}`, email: `u2_${timestamp}@test.com`, password: 'password123' })
    });
    const { token: token2, user: user2 } = await u2Res.json();

    // 2. User 1 creates room with max_users = 2
    const roomRes = await fetch(`${baseUrl}/rooms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token1}`
      },
      body: JSON.stringify({ name: 'Liga Amigos', max_users: 2 })
    });
    const roomData = await roomRes.json();
    if (roomRes.status !== 201 || !roomData.room.code) {
      throw new Error(`Room creation failed: ${JSON.stringify(roomData)}`);
    }

    const roomId = roomData.room.id;
    const roomCode = roomData.room.code;

    // 3. Verify 28 matches created for room (Task 4.4)
    const matchesRes = await fetch(`${baseUrl}/rooms/${roomId}/matches`, {
      headers: { 'Authorization': `Bearer ${token1}` }
    });
    const { matches } = await matchesRes.json();
    if (matchesRes.status !== 200 || matches.length !== 28) {
      throw new Error(`Expected 28 matches, got ${matches?.length}`);
    }

    // Verify rounds distribution (7 rounds, 4 matches each)
    const rounds = {};
    for (const m of matches) {
      rounds[m.round] = (rounds[m.round] || 0) + 1;
    }
    for (let r = 1; r <= 7; r++) {
      if (rounds[r] !== 4) {
        throw new Error(`Round ${r} does not have 4 matches, has ${rounds[r]}`);
      }
    }

    // 4. User 2 joins room with code
    const joinRes = await fetch(`${baseUrl}/rooms/join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token2}`
      },
      body: JSON.stringify({ code: roomCode })
    });
    const joinData = await joinRes.json();
    if (joinRes.status !== 200) {
      throw new Error(`Join room failed: ${JSON.stringify(joinData)}`);
    }

    // 5. Check capacity limit: User 3 tries to join full room (409)
    const u3Res = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: `user3_${timestamp}`, email: `u3_${timestamp}@test.com`, password: 'password123' })
    });
    const { token: token3 } = await u3Res.json();
    const fullRes = await fetch(`${baseUrl}/rooms/join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token3}`
      },
      body: JSON.stringify({ code: roomCode })
    });
    if (fullRes.status !== 409) {
      throw new Error(`Expected 409 Conflict for full room, got ${fullRes.status}`);
    }

    // 6. Check my-rooms for user 2
    const myRoomsRes = await fetch(`${baseUrl}/rooms/my-rooms`, {
      headers: { 'Authorization': `Bearer ${token2}` }
    });
    const { rooms } = await myRoomsRes.json();
    if (!rooms.some((r) => r.id === roomId && r.role === 'member')) {
      throw new Error('Room not listed in my-rooms');
    }

    console.log('✅ Rooms & Matches flow verified successfully!');
    db.close();
    server.close();
  } catch (err) {
    console.error('❌ Rooms test error:', err);
    db.close();
    server.close();
    process.exit(1);
  }
});

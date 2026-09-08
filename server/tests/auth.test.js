import express from 'express';
import { initializeDatabase } from '../src/shared/infrastructure/db/initDb.js';
import { createAuthRouter } from '../src/modules/users/infrastructure/http/authRoutes.js';
import { errorHandler } from '../src/shared/infrastructure/http/errorHandler.js';

initializeDatabase();

const app = express();
app.use(express.json());
app.use('/api/auth', createAuthRouter());
app.use(errorHandler);

const server = app.listen(0, async () => {
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}/api/auth`;

  try {
    const timestamp = Date.now();
    const testUsername = `user_${timestamp}`;
    const testEmail = `user_${timestamp}@example.com`;
    const testPassword = 'password123';

    // 1. Register
    const regRes = await fetch(`${baseUrl}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: testUsername, email: testEmail, password: testPassword })
    });
    const regData = await regRes.json();
    if (regRes.status !== 201 || !regData.token || regData.user.username !== testUsername) {
      throw new Error(`Register failed: ${JSON.stringify(regData)}`);
    }

    // 2. Duplicate Register (Conflict 409)
    const dupRes = await fetch(`${baseUrl}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: testUsername, email: testEmail, password: testPassword })
    });
    if (dupRes.status !== 409) {
      throw new Error(`Expected 409 Conflict, got ${dupRes.status}`);
    }

    // 3. Login
    const loginRes = await fetch(`${baseUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: testPassword })
    });
    const loginData = await loginRes.json();
    if (loginRes.status !== 200 || !loginData.token) {
      throw new Error(`Login failed: ${JSON.stringify(loginData)}`);
    }

    // 4. Me (Auth middleware)
    const meRes = await fetch(`${baseUrl}/me`, {
      headers: { 'Authorization': `Bearer ${loginData.token}` }
    });
    const meData = await meRes.json();
    if (meRes.status !== 200 || meData.user.username !== testUsername) {
      throw new Error(`Me failed: ${JSON.stringify(meData)}`);
    }

    // 5. Invalid credentials (401)
    const invalidLogin = await fetch(`${baseUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: 'wrongpassword' })
    });
    if (invalidLogin.status !== 401) {
      throw new Error(`Expected 401, got ${invalidLogin.status}`);
    }

    console.log('✅ Auth endpoints verified successfully!');
    import('../src/shared/infrastructure/db/connection.js').then(({ db }) => {
      db.close();
      server.close();
    });
  } catch (err) {
    console.error('❌ Auth test error:', err);
    server.close();
    process.exit(1);
  }
});

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeDatabase } from './shared/infrastructure/db/initDb.js';
import { createApiRouter } from './shared/infrastructure/http/apiRouter.js';
import { errorHandler } from './shared/infrastructure/http/errorHandler.js';

dotenv.config();

// Ensure database schema is ready
initializeDatabase();

export const app = express();

app.use(cors());
app.use(express.json());

// API health endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Main API Router
app.use('/api', createApiRouter());

// Centralized error handling
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

if (process.argv[1] && process.argv[1].endsWith('app.js')) {
  const server = app.listen(PORT, () => {
    console.log(`Fantasy Bets server running on http://localhost:${PORT}`);
  });

  process.on('SIGTERM', () => {
    server.close(() => console.log('Process terminated'));
  });
}

export default app;

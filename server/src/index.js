import { onRequest } from 'firebase-functions/v2/https';
import { app } from './app.js';

export const api = onRequest({
  cors: true,
  invoker: 'public'
}, app);

export default api;

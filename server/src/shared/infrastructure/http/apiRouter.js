import { Router } from 'express';
import { createAuthRouter } from '../../../modules/users/infrastructure/http/authRoutes.js';
import { createRoomRouter } from '../../../modules/rooms/infrastructure/http/roomRoutes.js';
import { createBetRouter } from '../../../modules/bets/infrastructure/http/betRoutes.js';

export function createApiRouter() {
  const router = Router();

  router.use('/auth', createAuthRouter());
  router.use('/rooms', createRoomRouter());
  router.use('/rooms', createBetRouter());

  return router;
}

export default createApiRouter;

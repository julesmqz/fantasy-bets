import { Router } from 'express';
import { FirestoreBetRepository } from '../FirestoreBetRepository.js';
import { FirestoreRoomRepository } from '../../../rooms/infrastructure/FirestoreRoomRepository.js';
import { FirestoreMatchRepository } from '../../../matches/infrastructure/FirestoreMatchRepository.js';
import { LigaMXSoccerEngine } from '../../../matches/infrastructure/LigaMXSoccerEngine.js';
import { PlaceOrUpdateBet } from '../../application/PlaceOrUpdateBet.js';
import { GetUserRoomBets } from '../../application/GetUserRoomBets.js';
import { GetLeaderboard } from '../../application/GetLeaderboard.js';
import { SimulateAndSettleRoom } from '../../application/SimulateAndSettleRoom.js';
import { BetController } from './BetController.js';
import { authMiddleware } from '../../../../shared/infrastructure/http/authMiddleware.js';

export function createBetRouter() {
  const router = Router({ mergeParams: true });

  const betRepository = new FirestoreBetRepository();
  const roomRepository = new FirestoreRoomRepository();
  const matchRepository = new FirestoreMatchRepository();
  const sportEngine = new LigaMXSoccerEngine();

  const placeOrUpdateBet = new PlaceOrUpdateBet({ betRepository, roomRepository, matchRepository });
  const getUserRoomBets = new GetUserRoomBets({ betRepository, roomRepository });
  const getLeaderboard = new GetLeaderboard({ roomRepository });
  const simulateAndSettleRoom = new SimulateAndSettleRoom({
    roomRepository,
    matchRepository,
    betRepository,
    sportEngine
  });

  const betController = new BetController({
    placeOrUpdateBet,
    getUserRoomBets,
    getLeaderboard,
    simulateAndSettleRoom
  });

  router.use(authMiddleware);

  router.post('/:roomId/bets', betController.placeBet);
  router.get('/:roomId/bets/me', betController.getMyBets);
  router.post('/:roomId/simulate', betController.simulate);
  router.get('/:roomId/leaderboard', betController.getLeaderboard);

  return router;
}

export default createBetRouter;

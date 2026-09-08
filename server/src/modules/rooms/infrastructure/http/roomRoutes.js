import { Router } from 'express';
import { SQLiteRoomRepository } from '../SQLiteRoomRepository.js';
import { SQLiteMatchRepository } from '../../../matches/infrastructure/SQLiteMatchRepository.js';
import { LigaMXSoccerEngine } from '../../../matches/infrastructure/LigaMXSoccerEngine.js';
import { CreateRoom } from '../../application/CreateRoom.js';
import { JoinRoomByCode } from '../../application/JoinRoomByCode.js';
import { GetUserRooms } from '../../application/GetUserRooms.js';
import { GetRoomById } from '../../application/GetRoomById.js';
import { GetRoomMatches } from '../../../matches/application/GetRoomMatches.js';
import { RoomController } from './RoomController.js';
import { authMiddleware } from '../../../../shared/infrastructure/http/authMiddleware.js';

export function createRoomRouter() {
  const router = Router();

  const roomRepository = new SQLiteRoomRepository();
  const matchRepository = new SQLiteMatchRepository();
  const sportEngine = new LigaMXSoccerEngine();

  const createRoom = new CreateRoom({ roomRepository, matchRepository, sportEngine });
  const joinRoomByCode = new JoinRoomByCode({ roomRepository });
  const getUserRooms = new GetUserRooms({ roomRepository });
  const getRoomById = new GetRoomById({ roomRepository });
  const getRoomMatches = new GetRoomMatches({ matchRepository, roomRepository });

  const roomController = new RoomController({
    createRoom,
    joinRoomByCode,
    getUserRooms,
    getRoomById,
    getRoomMatches
  });

  // All room routes require authentication
  router.use(authMiddleware);

  router.post('/', roomController.create);
  router.post('/join', roomController.join);
  router.get('/my-rooms', roomController.myRooms);
  router.get('/:roomId', roomController.getById);
  router.get('/:roomId/matches', roomController.getMatches);

  return router;
}

export default createRoomRouter;

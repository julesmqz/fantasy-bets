import { NotFoundError } from '../../../shared/domain/errors/index.js';

export class GetUserRoomBets {
  constructor({ betRepository, roomRepository }) {
    this.betRepository = betRepository;
    this.roomRepository = roomRepository;
  }

  async execute({ roomId, userId }) {
    const room = await this.roomRepository.findById(roomId);
    if (!room) {
      throw new NotFoundError('Room not found');
    }

    const bets = await this.betRepository.findByRoomAndUser(roomId, userId);
    return bets.map((b) => b.toJSON());
  }
}

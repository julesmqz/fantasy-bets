import { NotFoundError } from '../../../shared/domain/errors/index.js';

export class GetRoomMatches {
  constructor({ matchRepository, roomRepository }) {
    this.matchRepository = matchRepository;
    this.roomRepository = roomRepository;
  }

  async execute({ roomId }) {
    const room = await this.roomRepository.findById(roomId);
    if (!room) {
      throw new NotFoundError('Room not found');
    }

    const matches = await this.matchRepository.findByRoomId(roomId);
    return matches.map((m) => m.toJSON());
  }
}

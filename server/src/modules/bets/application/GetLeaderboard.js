import { NotFoundError } from '../../../shared/domain/errors/index.js';

export class GetLeaderboard {
  constructor({ roomRepository }) {
    this.roomRepository = roomRepository;
  }

  async execute({ roomId }) {
    const room = await this.roomRepository.findById(roomId);
    if (!room) {
      throw new NotFoundError('Room not found');
    }

    const members = await this.roomRepository.findMembersByRoomId(roomId);
    // Sort by score DESC, username ASC
    const sorted = [...members].sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return a.username.localeCompare(b.username);
    });

    return sorted.map((m, index) => ({
      rank: index + 1,
      userId: m.userId,
      username: m.username,
      score: m.score,
      joinedAt: m.joinedAt
    }));
  }
}

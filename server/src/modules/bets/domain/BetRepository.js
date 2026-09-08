/**
 * BetRepository Domain Interface
 */
export class BetRepository {
  async upsert(bet, dbInstance) {
    throw new Error('Not implemented');
  }

  async findByRoomAndUser(roomId, userId) {
    throw new Error('Not implemented');
  }

  async findByRoomId(roomId) {
    throw new Error('Not implemented');
  }

  async updatePoints(id, pointsAwarded, dbInstance) {
    throw new Error('Not implemented');
  }
}

/**
 * MatchRepository Domain Interface
 */
export class MatchRepository {
  async createMany(matches, dbInstance) {
    throw new Error('Not implemented');
  }

  async findByRoomId(roomId) {
    throw new Error('Not implemented');
  }

  async findById(id) {
    throw new Error('Not implemented');
  }

  async updateWinner(id, winner, status, dbInstance) {
    throw new Error('Not implemented');
  }
}

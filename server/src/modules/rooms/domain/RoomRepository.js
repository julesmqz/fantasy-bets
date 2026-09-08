/**
 * RoomRepository Domain Interface
 */
export class RoomRepository {
  async create(room, dbInstance) {
    throw new Error('Not implemented');
  }

  async findById(id) {
    throw new Error('Not implemented');
  }

  async findByCode(code) {
    throw new Error('Not implemented');
  }

  async addMember(roomId, userId, dbInstance) {
    throw new Error('Not implemented');
  }

  async isMember(roomId, userId) {
    throw new Error('Not implemented');
  }

  async countMembers(roomId) {
    throw new Error('Not implemented');
  }

  async findMembersByRoomId(roomId) {
    throw new Error('Not implemented');
  }

  async findRoomsByUserId(userId) {
    throw new Error('Not implemented');
  }

  async updateStatus(id, status, dbInstance) {
    throw new Error('Not implemented');
  }

  async updateMemberScore(roomId, userId, score, dbInstance) {
    throw new Error('Not implemented');
  }
}

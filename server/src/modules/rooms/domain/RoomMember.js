export class RoomMember {
  constructor({ id, roomId, userId, username, score = 0, joinedAt }) {
    this.id = id;
    this.roomId = roomId;
    this.userId = userId;
    this.username = username;
    this.score = score;
    this.joinedAt = joinedAt;
  }

  toJSON() {
    return {
      id: this.id,
      roomId: this.roomId,
      userId: this.userId,
      username: this.username,
      score: this.score,
      joinedAt: this.joinedAt
    };
  }
}

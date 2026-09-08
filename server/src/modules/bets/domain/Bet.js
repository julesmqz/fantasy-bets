export class Bet {
  constructor({ id, roomId, matchId, userId, predictedWinner, pointsAwarded = 0, createdAt, updatedAt }) {
    this.id = id;
    this.roomId = roomId;
    this.matchId = matchId;
    this.userId = userId;
    this.predictedWinner = predictedWinner;
    this.pointsAwarded = pointsAwarded;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  toJSON() {
    return {
      id: this.id,
      roomId: this.roomId,
      matchId: this.matchId,
      userId: this.userId,
      predictedWinner: this.predictedWinner,
      pointsAwarded: this.pointsAwarded,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

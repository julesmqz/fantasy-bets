export class Match {
  constructor({ id, roomId, round, homeTeam, awayTeam, winner = null, status = 'pending', createdAt }) {
    this.id = id;
    this.roomId = roomId;
    this.round = round;
    this.homeTeam = homeTeam;
    this.awayTeam = awayTeam;
    this.winner = winner;
    this.status = status;
    this.createdAt = createdAt;
  }

  toJSON() {
    return {
      id: this.id,
      roomId: this.roomId,
      round: this.round,
      homeTeam: this.homeTeam,
      awayTeam: this.awayTeam,
      winner: this.winner,
      status: this.status,
      createdAt: this.createdAt
    };
  }
}

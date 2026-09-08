import { NotFoundError, ForbiddenError, ConflictError } from '../../../shared/domain/errors/index.js';
import { db } from '../../../shared/infrastructure/db/connection.js';

export class SimulateAndSettleRoom {
  constructor({ roomRepository, matchRepository, betRepository, sportEngine, database = db }) {
    this.roomRepository = roomRepository;
    this.matchRepository = matchRepository;
    this.betRepository = betRepository;
    this.sportEngine = sportEngine;
    this.db = database;
  }

  async execute({ roomId, userId }) {
    const room = await this.roomRepository.findById(roomId);
    if (!room) {
      throw new NotFoundError('Room not found');
    }

    if (room.creatorId !== userId) {
      throw new ForbiddenError('Only the room creator can simulate and settle the tournament');
    }

    if (room.isCompleted()) {
      throw new ConflictError('Room is already completed');
    }

    // Atomic SQLite Transaction
    const settleTransaction = this.db.transaction(() => {
      // 1. Fetch matches
      const getMatchesStmt = this.db.prepare('SELECT * FROM matches WHERE room_id = ?');
      const matches = getMatchesStmt.all(roomId);

      const updateMatchStmt = this.db.prepare(`
        UPDATE matches
        SET winner = ?, status = 'finished'
        WHERE id = ?
      `);

      const matchWinners = new Map();
      for (const m of matches) {
        const winner = this.sportEngine.simulateWinner({
          homeTeam: m.home_team,
          awayTeam: m.away_team
        });
        updateMatchStmt.run(winner, m.id);
        matchWinners.set(m.id, winner);
      }

      // 2. Mark room completed
      const updateRoomStmt = this.db.prepare(`
        UPDATE rooms
        SET status = 'completed'
        WHERE id = ?
      `);
      updateRoomStmt.run(roomId);

      // 3. Fetch all bets
      const getBetsStmt = this.db.prepare('SELECT * FROM bets WHERE room_id = ?');
      const bets = getBetsStmt.all(roomId);

      const updateBetStmt = this.db.prepare(`
        UPDATE bets
        SET points_awarded = ?
        WHERE id = ?
      `);

      const userScores = new Map();
      for (const b of bets) {
        const actualWinner = matchWinners.get(b.match_id);
        const hit = actualWinner && b.predicted_winner === actualWinner;
        const points = hit ? 1 : 0;
        updateBetStmt.run(points, b.id);

        const currentScore = userScores.get(b.user_id) || 0;
        userScores.set(b.user_id, currentScore + points);
      }

      // 4. Update room_members scores
      const getMembersStmt = this.db.prepare('SELECT user_id FROM room_members WHERE room_id = ?');
      const members = getMembersStmt.all(roomId);

      const updateScoreStmt = this.db.prepare(`
        UPDATE room_members
        SET score = ?
        WHERE room_id = ? AND user_id = ?
      `);

      for (const m of members) {
        const total = userScores.get(m.user_id) || 0;
        updateScoreStmt.run(total, roomId, m.user_id);
      }
    });

    // Execute atomic transaction
    settleTransaction();

    const updatedRoom = await this.roomRepository.findById(roomId);
    return updatedRoom.toJSON();
  }
}

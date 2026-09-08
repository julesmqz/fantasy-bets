import { BetRepository } from '../domain/BetRepository.js';
import { Bet } from '../domain/Bet.js';
import { db } from '../../../shared/infrastructure/db/connection.js';

export class SQLiteBetRepository extends BetRepository {
  constructor(database = db) {
    super();
    this.db = database;
  }

  _mapToEntity(row) {
    if (!row) return null;
    return new Bet({
      id: row.id,
      roomId: row.room_id,
      matchId: row.match_id,
      userId: row.user_id,
      predictedWinner: row.predicted_winner,
      pointsAwarded: row.points_awarded,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    });
  }

  async upsert({ roomId, matchId, userId, predictedWinner }, dbInstance = this.db) {
    const stmt = dbInstance.prepare(`
      INSERT INTO bets (room_id, match_id, user_id, predicted_winner, updated_at)
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(room_id, match_id, user_id) DO UPDATE SET
        predicted_winner = excluded.predicted_winner,
        updated_at = CURRENT_TIMESTAMP
    `);
    stmt.run(roomId, matchId, userId, predictedWinner);

    const getStmt = dbInstance.prepare(`
      SELECT * FROM bets
      WHERE room_id = ? AND match_id = ? AND user_id = ?
    `);
    const row = getStmt.get(roomId, matchId, userId);
    return this._mapToEntity(row);
  }

  async findByRoomAndUser(roomId, userId) {
    const stmt = this.db.prepare(`
      SELECT * FROM bets
      WHERE room_id = ? AND user_id = ?
    `);
    const rows = stmt.all(roomId, userId);
    return rows.map((r) => this._mapToEntity(r));
  }

  async findByRoomId(roomId) {
    const stmt = this.db.prepare(`
      SELECT * FROM bets
      WHERE room_id = ?
    `);
    const rows = stmt.all(roomId);
    return rows.map((r) => this._mapToEntity(r));
  }

  async updatePoints(id, pointsAwarded, dbInstance = this.db) {
    const stmt = dbInstance.prepare(`
      UPDATE bets
      SET points_awarded = ?
      WHERE id = ?
    `);
    stmt.run(pointsAwarded, id);
  }
}

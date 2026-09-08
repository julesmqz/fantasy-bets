import { MatchRepository } from '../domain/MatchRepository.js';
import { Match } from '../domain/Match.js';
import { db } from '../../../shared/infrastructure/db/connection.js';

export class SQLiteMatchRepository extends MatchRepository {
  constructor(database = db) {
    super();
    this.db = database;
  }

  _mapToEntity(row) {
    if (!row) return null;
    return new Match({
      id: row.id,
      roomId: row.room_id,
      round: row.round,
      homeTeam: row.home_team,
      awayTeam: row.away_team,
      winner: row.winner,
      status: row.status,
      createdAt: row.created_at
    });
  }

  async createMany(matches, dbInstance = this.db) {
    const insertStmt = dbInstance.prepare(`
      INSERT INTO matches (room_id, round, home_team, away_team, status)
      VALUES (?, ?, ?, ?, 'pending')
    `);

    const insertMany = dbInstance.transaction((items) => {
      for (const m of items) {
        insertStmt.run(m.roomId, m.round, m.homeTeam, m.awayTeam);
      }
    });

    insertMany(matches);
    return this.findByRoomId(matches[0]?.roomId);
  }

  async findByRoomId(roomId) {
    const stmt = this.db.prepare(`
      SELECT * FROM matches
      WHERE room_id = ?
      ORDER BY round ASC, id ASC
    `);
    const rows = stmt.all(roomId);
    return rows.map((r) => this._mapToEntity(r));
  }

  async findById(id) {
    const stmt = this.db.prepare('SELECT * FROM matches WHERE id = ?');
    const row = stmt.get(id);
    return this._mapToEntity(row);
  }

  async updateWinner(id, winner, status = 'finished', dbInstance = this.db) {
    const stmt = dbInstance.prepare(`
      UPDATE matches
      SET winner = ?, status = ?
      WHERE id = ?
    `);
    stmt.run(winner, status, id);
    return this.findById(id);
  }
}

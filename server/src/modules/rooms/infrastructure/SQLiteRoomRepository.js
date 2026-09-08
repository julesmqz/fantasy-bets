import { RoomRepository } from '../domain/RoomRepository.js';
import { Room } from '../domain/Room.js';
import { RoomMember } from '../domain/RoomMember.js';
import { db } from '../../../shared/infrastructure/db/connection.js';

export class SQLiteRoomRepository extends RoomRepository {
  constructor(database = db) {
    super();
    this.db = database;
  }

  _mapRoom(row) {
    if (!row) return null;
    return new Room({
      id: row.id,
      name: row.name,
      code: row.code,
      creatorId: row.creator_id,
      maxUsers: row.max_users,
      status: row.status,
      createdAt: row.created_at,
      memberCount: row.member_count ?? 0
    });
  }

  async create({ name, code, creatorId, maxUsers }, dbInstance = this.db) {
    const stmt = dbInstance.prepare(`
      INSERT INTO rooms (name, code, creator_id, max_users, status)
      VALUES (?, ?, ?, ?, 'open')
    `);
    const info = stmt.run(name, code, creatorId, maxUsers);
    return this.findById(info.lastInsertRowid, dbInstance);
  }

  async findById(id, dbInstance = this.db) {
    const stmt = dbInstance.prepare(`
      SELECT r.*,
             (SELECT COUNT(*) FROM room_members rm WHERE rm.room_id = r.id) as member_count
      FROM rooms r
      WHERE r.id = ?
    `);
    const row = stmt.get(id);
    return this._mapRoom(row);
  }

  async findByCode(code, dbInstance = this.db) {
    const stmt = dbInstance.prepare(`
      SELECT r.*,
             (SELECT COUNT(*) FROM room_members rm WHERE rm.room_id = r.id) as member_count
      FROM rooms r
      WHERE UPPER(r.code) = UPPER(?)
    `);
    const row = stmt.get(code);
    return this._mapRoom(row);
  }

  async addMember(roomId, userId, dbInstance = this.db) {
    const stmt = dbInstance.prepare(`
      INSERT OR IGNORE INTO room_members (room_id, user_id, score)
      VALUES (?, ?, 0)
    `);
    stmt.run(roomId, userId);
  }

  async isMember(roomId, userId) {
    const stmt = this.db.prepare(`
      SELECT 1 FROM room_members
      WHERE room_id = ? AND user_id = ?
    `);
    return !!stmt.get(roomId, userId);
  }

  async countMembers(roomId) {
    const stmt = this.db.prepare('SELECT COUNT(*) as count FROM room_members WHERE room_id = ?');
    const row = stmt.get(roomId);
    return row ? row.count : 0;
  }

  async findMembersByRoomId(roomId) {
    const stmt = this.db.prepare(`
      SELECT rm.id, rm.room_id, rm.user_id, rm.score, rm.joined_at, u.username
      FROM room_members rm
      JOIN users u ON u.id = rm.user_id
      WHERE rm.room_id = ?
      ORDER BY rm.score DESC, u.username ASC
    `);
    const rows = stmt.all(roomId);
    return rows.map((r) => new RoomMember({
      id: r.id,
      roomId: r.room_id,
      userId: r.user_id,
      username: r.username,
      score: r.score,
      joinedAt: r.joined_at
    }));
  }

  async findRoomsByUserId(userId) {
    const stmt = this.db.prepare(`
      SELECT r.*,
             (SELECT COUNT(*) FROM room_members rm2 WHERE rm2.room_id = r.id) as member_count,
             CASE WHEN r.creator_id = ? THEN 'creator' ELSE 'member' END as role
      FROM rooms r
      JOIN room_members rm ON rm.room_id = r.id
      WHERE rm.user_id = ?
      ORDER BY r.created_at DESC
    `);
    const rows = stmt.all(userId, userId);
    return rows.map((row) => ({
      ...this._mapRoom(row).toJSON(),
      role: row.role
    }));
  }

  async updateStatus(id, status, dbInstance = this.db) {
    const stmt = dbInstance.prepare('UPDATE rooms SET status = ? WHERE id = ?');
    stmt.run(status, id);
    return this.findById(id, dbInstance);
  }

  async updateMemberScore(roomId, userId, score, dbInstance = this.db) {
    const stmt = dbInstance.prepare(`
      UPDATE room_members
      SET score = ?
      WHERE room_id = ? AND user_id = ?
    `);
    stmt.run(score, roomId, userId);
  }
}

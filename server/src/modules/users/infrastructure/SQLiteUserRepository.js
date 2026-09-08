import { UserRepository } from '../domain/UserRepository.js';
import { User } from '../domain/User.js';
import { db } from '../../../shared/infrastructure/db/connection.js';

export class SQLiteUserRepository extends UserRepository {
  constructor(database = db) {
    super();
    this.db = database;
  }

  _mapToEntity(row) {
    if (!row) return null;
    return new User({
      id: row.id,
      username: row.username,
      email: row.email,
      passwordHash: row.password_hash,
      createdAt: row.created_at
    });
  }

  async findById(id) {
    const stmt = this.db.prepare('SELECT * FROM users WHERE id = ?');
    const row = stmt.get(id);
    return this._mapToEntity(row);
  }

  async findByEmail(email) {
    const stmt = this.db.prepare('SELECT * FROM users WHERE LOWER(email) = LOWER(?)');
    const row = stmt.get(email);
    return this._mapToEntity(row);
  }

  async findByUsername(username) {
    const stmt = this.db.prepare('SELECT * FROM users WHERE LOWER(username) = LOWER(?)');
    const row = stmt.get(username);
    return this._mapToEntity(row);
  }

  async create({ username, email, passwordHash }) {
    const stmt = this.db.prepare(`
      INSERT INTO users (username, email, password_hash)
      VALUES (?, ?, ?)
    `);
    const info = stmt.run(username, email, passwordHash);
    return this.findById(info.lastInsertRowid);
  }
}

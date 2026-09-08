import Database from 'better-sqlite3';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const dbPath = process.env.DB_PATH || path.resolve(process.cwd(), 'fantasy_bets.db');
export const db = new Database(dbPath);

// Enforce foreign key constraints
db.pragma('foreign_keys = ON');

export default db;

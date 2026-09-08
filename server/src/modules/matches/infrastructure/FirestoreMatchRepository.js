import { MatchRepository } from '../domain/MatchRepository.js';
import { Match } from '../domain/Match.js';
import { db } from '../../../shared/infrastructure/db/firestore.js';

export class FirestoreMatchRepository extends MatchRepository {
  constructor(database = db) {
    super();
    this.db = database;
    this.collection = this.db.collection('matches');
  }

  _mapToEntity(data) {
    if (!data) return null;
    return new Match({
      id: data.id,
      roomId: String(data.room_id || data.roomId),
      round: Number(data.round),
      homeTeam: data.home_team || data.homeTeam,
      awayTeam: data.away_team || data.awayTeam,
      winner: data.winner ?? null,
      status: data.status || 'pending',
      createdAt: data.created_at || data.createdAt
    });
  }

  async createMany(matches, dbInstance = this.db) {
    if (!matches || matches.length === 0) return [];

    const batch = dbInstance.batch();
    const createdList = [];
    const now = new Date().toISOString();

    for (const m of matches) {
      const docRef = this.collection.doc();
      const matchData = {
        room_id: String(m.roomId),
        round: Number(m.round),
        home_team: m.homeTeam,
        away_team: m.awayTeam,
        winner: null,
        status: 'pending',
        created_at: now
      };
      batch.set(docRef, matchData);
      createdList.push({ id: docRef.id, ...matchData });
    }

    await batch.commit();
    return createdList.map((m) => this._mapToEntity(m));
  }

  async findByRoomId(roomId) {
    const snapshot = await this.collection
      .where('room_id', '==', String(roomId))
      .get();

    if (snapshot.empty) return [];

    const matches = snapshot.docs.map((doc) =>
      this._mapToEntity({ id: doc.id, ...doc.data() })
    );

    matches.sort((a, b) => {
      if (a.round !== b.round) return a.round - b.round;
      return (a.createdAt || '').localeCompare(b.createdAt || '');
    });

    return matches;
  }

  async findById(id) {
    if (!id) return null;
    const doc = await this.collection.doc(String(id)).get();
    if (!doc.exists) return null;
    return this._mapToEntity({ id: doc.id, ...doc.data() });
  }

  async updateWinner(id, winner, status = 'finished', dbInstance = this.db) {
    const docRef = this.collection.doc(String(id));
    if (dbInstance && typeof dbInstance.update === 'function') {
      dbInstance.update(docRef, { winner, status });
    } else {
      await docRef.update({ winner, status });
    }
    return this.findById(id);
  }
}

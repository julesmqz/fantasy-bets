import { BetRepository } from '../domain/BetRepository.js';
import { Bet } from '../domain/Bet.js';
import { db } from '../../../shared/infrastructure/db/firestore.js';

export class FirestoreBetRepository extends BetRepository {
  constructor(database = db) {
    super();
    this.db = database;
    this.collection = this.db.collection('bets');
  }

  _mapToEntity(data) {
    if (!data) return null;
    return new Bet({
      id: data.id,
      roomId: String(data.room_id || data.roomId),
      matchId: String(data.match_id || data.matchId),
      userId: String(data.user_id || data.userId),
      predictedWinner: data.predicted_winner || data.predictedWinner,
      pointsAwarded: Number(data.points_awarded ?? data.pointsAwarded ?? 0),
      createdAt: data.created_at || data.createdAt,
      updatedAt: data.updated_at || data.updatedAt
    });
  }

  async upsert({ roomId, matchId, userId, predictedWinner }, dbInstance = this.db) {
    const betId = `${roomId}_${matchId}_${userId}`;
    const docRef = this.collection.doc(betId);
    const now = new Date().toISOString();
    const doc = await docRef.get();

    if (doc.exists) {
      const updateData = {
        predicted_winner: predictedWinner,
        updated_at: now
      };
      if (dbInstance && typeof dbInstance.update === 'function') {
        dbInstance.update(docRef, updateData);
      } else {
        await docRef.update(updateData);
      }
      return this._mapToEntity({
        id: betId,
        ...doc.data(),
        ...updateData
      });
    } else {
      const newData = {
        room_id: String(roomId),
        match_id: String(matchId),
        user_id: String(userId),
        predicted_winner: predictedWinner,
        points_awarded: 0,
        created_at: now,
        updated_at: now
      };
      if (dbInstance && typeof dbInstance.set === 'function') {
        dbInstance.set(docRef, newData);
      } else {
        await docRef.set(newData);
      }
      return this._mapToEntity({ id: betId, ...newData });
    }
  }

  async findByRoomAndUser(roomId, userId) {
    const snapshot = await this.collection
      .where('room_id', '==', String(roomId))
      .where('user_id', '==', String(userId))
      .get();

    if (snapshot.empty) return [];
    return snapshot.docs.map((doc) =>
      this._mapToEntity({ id: doc.id, ...doc.data() })
    );
  }

  async findByRoomId(roomId) {
    const snapshot = await this.collection
      .where('room_id', '==', String(roomId))
      .get();

    if (snapshot.empty) return [];
    return snapshot.docs.map((doc) =>
      this._mapToEntity({ id: doc.id, ...doc.data() })
    );
  }

  async updatePoints(id, pointsAwarded, dbInstance = this.db) {
    const docRef = this.collection.doc(String(id));
    if (dbInstance && typeof dbInstance.update === 'function') {
      dbInstance.update(docRef, { points_awarded: Number(pointsAwarded) });
    } else {
      await docRef.update({ points_awarded: Number(pointsAwarded) });
    }
  }
}

import { RoomRepository } from '../domain/RoomRepository.js';
import { Room } from '../domain/Room.js';
import { RoomMember } from '../domain/RoomMember.js';
import { db, FieldValue } from '../../../shared/infrastructure/db/firestore.js';

export class FirestoreRoomRepository extends RoomRepository {
  constructor(database = db) {
    super();
    this.db = database;
    this.roomsCollection = this.db.collection('rooms');
    this.membersCollection = this.db.collection('room_members');
  }

  _mapRoom(data) {
    if (!data) return null;
    return new Room({
      id: data.id,
      name: data.name,
      code: data.code,
      creatorId: String(data.creator_id || data.creatorId),
      maxUsers: Number(data.max_users ?? data.maxUsers),
      status: data.status || 'open',
      createdAt: data.created_at || data.createdAt,
      memberCount: Number(data.member_count ?? data.memberCount ?? 0)
    });
  }

  async create({ name, code, creatorId, maxUsers }) {
    const docRef = this.roomsCollection.doc();
    const now = new Date().toISOString();
    const roomData = {
      name,
      code: String(code).toUpperCase(),
      creator_id: String(creatorId),
      max_users: Number(maxUsers),
      status: 'open',
      member_ids: [String(creatorId)],
      created_at: now
    };

    await docRef.set(roomData);
    return this.findById(docRef.id);
  }

  async findById(id) {
    if (!id) return null;
    const doc = await this.roomsCollection.doc(String(id)).get();
    if (!doc.exists) return null;
    const count = await this.countMembers(doc.id);
    return this._mapRoom({ id: doc.id, ...doc.data(), member_count: count });
  }

  async findByCode(code) {
    if (!code) return null;
    const snapshot = await this.roomsCollection
      .where('code', '==', String(code).toUpperCase())
      .limit(1)
      .get();

    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    const count = await this.countMembers(doc.id);
    return this._mapRoom({ id: doc.id, ...doc.data(), member_count: count });
  }

  async addMember(roomId, userId) {
    const memberId = `${roomId}_${userId}`;
    const memberRef = this.membersCollection.doc(memberId);
    const existing = await memberRef.get();

    if (!existing.exists) {
      await memberRef.set({
        room_id: String(roomId),
        user_id: String(userId),
        score: 0,
        joined_at: new Date().toISOString()
      });

      await this.roomsCollection.doc(String(roomId)).update({
        member_ids: FieldValue.arrayUnion(String(userId))
      }).catch(() => {});
    }
  }

  async isMember(roomId, userId) {
    const memberId = `${roomId}_${userId}`;
    const doc = await this.membersCollection.doc(memberId).get();
    return doc.exists;
  }

  async countMembers(roomId) {
    const snapshot = await this.membersCollection
      .where('room_id', '==', String(roomId))
      .count()
      .get();
    return snapshot.data().count;
  }

  async findMembersByRoomId(roomId) {
    const snapshot = await this.membersCollection
      .where('room_id', '==', String(roomId))
      .get();

    if (snapshot.empty) return [];

    const userIds = [...new Set(snapshot.docs.map((d) => d.data().user_id))];
    const userDocs = await Promise.all(
      userIds.map((uid) => this.db.collection('users').doc(String(uid)).get())
    );

    const userMap = new Map();
    userDocs.forEach((d) => {
      if (d.exists) {
        userMap.set(d.id, d.data().username);
      }
    });

    const members = snapshot.docs.map((d) => {
      const data = d.data();
      return new RoomMember({
        id: d.id,
        roomId: data.room_id,
        userId: data.user_id,
        username: userMap.get(data.user_id) || 'Participante',
        score: data.score || 0,
        joinedAt: data.joined_at
      });
    });

    members.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.username.localeCompare(b.username);
    });

    return members;
  }

  async findRoomsByUserId(userId) {
    const uid = String(userId);
    const snapshot = await this.roomsCollection
      .where('member_ids', 'array-contains', uid)
      .get();

    if (snapshot.empty) return [];

    const rooms = await Promise.all(
      snapshot.docs.map(async (doc) => {
        const data = doc.data();
        const count = await this.countMembers(doc.id);
        const role = data.creator_id === uid ? 'creator' : 'member';
        return {
          ...this._mapRoom({ id: doc.id, ...data, member_count: count }).toJSON(),
          role
        };
      })
    );

    rooms.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return rooms;
  }

  async updateStatus(id, status) {
    await this.roomsCollection.doc(String(id)).update({ status });
    return this.findById(id);
  }

  async updateMemberScore(roomId, userId, score) {
    const memberId = `${roomId}_${userId}`;
    await this.membersCollection.doc(memberId).update({ score });
  }
}

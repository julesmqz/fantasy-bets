import { UserRepository } from '../domain/UserRepository.js';
import { User } from '../domain/User.js';
import { db } from '../../../shared/infrastructure/db/firestore.js';

export class FirestoreUserRepository extends UserRepository {
  constructor(database = db) {
    super();
    this.db = database;
    this.collection = this.db.collection('users');
  }

  _mapToEntity(data) {
    if (!data) return null;
    return new User({
      id: data.id,
      username: data.username,
      email: data.email,
      passwordHash: data.password_hash || data.passwordHash,
      createdAt: data.created_at || data.createdAt
    });
  }

  async findById(id) {
    if (!id) return null;
    const doc = await this.collection.doc(String(id)).get();
    if (!doc.exists) return null;
    return this._mapToEntity({ id: doc.id, ...doc.data() });
  }

  async findByEmail(email) {
    if (!email) return null;
    const snapshot = await this.collection
      .where('email_lower', '==', email.toLowerCase())
      .limit(1)
      .get();

    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return this._mapToEntity({ id: doc.id, ...doc.data() });
  }

  async findByUsername(username) {
    if (!username) return null;
    const snapshot = await this.collection
      .where('username_lower', '==', username.toLowerCase())
      .limit(1)
      .get();

    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return this._mapToEntity({ id: doc.id, ...doc.data() });
  }

  async create({ username, email, passwordHash }) {
    const docRef = this.collection.doc();
    const now = new Date().toISOString();
    const userData = {
      username,
      username_lower: username.toLowerCase(),
      email,
      email_lower: email.toLowerCase(),
      password_hash: passwordHash,
      created_at: now
    };

    await docRef.set(userData);
    return this._mapToEntity({ id: docRef.id, ...userData });
  }
}

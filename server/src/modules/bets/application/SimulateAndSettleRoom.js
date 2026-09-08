import { NotFoundError, ForbiddenError, ConflictError } from '../../../shared/domain/errors/index.js';
import { db } from '../../../shared/infrastructure/db/firestore.js';

export class SimulateAndSettleRoom {
  constructor({ roomRepository, matchRepository, betRepository, sportEngine, database = db }) {
    this.roomRepository = roomRepository;
    this.matchRepository = matchRepository;
    this.betRepository = betRepository;
    this.sportEngine = sportEngine;
    this.db = database;
  }

  async execute({ roomId, userId }) {
    const rId = String(roomId);
    const uId = String(userId);

    const room = await this.roomRepository.findById(rId);
    if (!room) {
      throw new NotFoundError('Room not found');
    }

    if (String(room.creatorId) !== uId) {
      throw new ForbiddenError('Only the room creator can simulate and settle the tournament');
    }

    if (room.isCompleted()) {
      throw new ConflictError('Room is already completed');
    }

    // Atomic Firestore Transaction: ALL READS FIRST, THEN ALL WRITES
    await this.db.runTransaction(async (transaction) => {
      const roomRef = this.db.collection('rooms').doc(rId);
      const roomDoc = await transaction.get(roomRef);

      if (!roomDoc.exists) {
        throw new NotFoundError('Room not found');
      }

      if (roomDoc.data().status === 'completed') {
        throw new ConflictError('Room is already completed');
      }

      // 1. READS: Fetch matches, bets, members
      const matchesQuery = this.db.collection('matches').where('room_id', '==', rId);
      const betsQuery = this.db.collection('bets').where('room_id', '==', rId);
      const membersQuery = this.db.collection('room_members').where('room_id', '==', rId);

      const [matchesSnapshot, betsSnapshot, membersSnapshot] = await Promise.all([
        transaction.get(matchesQuery),
        transaction.get(betsQuery),
        transaction.get(membersQuery)
      ]);

      // 2. IN-MEMORY COMPUTATIONS
      const matchWinners = new Map();
      const matchUpdates = [];

      for (const matchDoc of matchesSnapshot.docs) {
        const m = matchDoc.data();
        const winner = this.sportEngine.simulateWinner({
          homeTeam: m.home_team || m.homeTeam,
          awayTeam: m.away_team || m.awayTeam
        });
        matchWinners.set(matchDoc.id, winner);
        matchUpdates.push({ ref: matchDoc.ref, winner });
      }

      const userScores = new Map();
      const betUpdates = [];

      for (const betDoc of betsSnapshot.docs) {
        const b = betDoc.data();
        const mId = String(b.match_id || b.matchId);
        const actualWinner = matchWinners.get(mId);
        const predWinner = b.predicted_winner || b.predictedWinner;
        const hit = actualWinner && predWinner === actualWinner;
        const points = hit ? 1 : 0;

        betUpdates.push({ ref: betDoc.ref, points });

        const bUserId = String(b.user_id || b.userId);
        const currentScore = userScores.get(bUserId) || 0;
        userScores.set(bUserId, currentScore + points);
      }

      const memberUpdates = [];
      for (const memberDoc of membersSnapshot.docs) {
        const memData = memberDoc.data();
        const memUserId = String(memData.user_id || memData.userId);
        const total = userScores.get(memUserId) || 0;
        memberUpdates.push({ ref: memberDoc.ref, score: total });
      }

      // 3. WRITES
      // Update room status
      transaction.update(roomRef, { status: 'completed' });

      // Update matches
      for (const update of matchUpdates) {
        transaction.update(update.ref, { winner: update.winner, status: 'finished' });
      }

      // Update bets points
      for (const update of betUpdates) {
        transaction.update(update.ref, { points_awarded: update.points });
      }

      // Update member scores
      for (const update of memberUpdates) {
        transaction.update(update.ref, { score: update.score });
      }
    });

    const updatedRoom = await this.roomRepository.findById(rId);
    return updatedRoom.toJSON();
  }
}

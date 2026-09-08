import { ValidationError, NotFoundError, ForbiddenError } from '../../../shared/domain/errors/index.js';

export class PlaceOrUpdateBet {
  constructor({ betRepository, roomRepository, matchRepository }) {
    this.betRepository = betRepository;
    this.roomRepository = roomRepository;
    this.matchRepository = matchRepository;
  }

  async execute({ roomId, matchId, userId, predictedWinner }) {
    if (!roomId || !matchId || !predictedWinner) {
      throw new ValidationError('roomId, matchId, and predictedWinner are required');
    }

    const room = await this.roomRepository.findById(roomId);
    if (!room) {
      throw new NotFoundError('Room not found');
    }

    if (room.isCompleted()) {
      throw new ForbiddenError('Cannot place bet on a completed room');
    }

    const isMember = await this.roomRepository.isMember(roomId, userId);
    if (!isMember) {
      throw new ForbiddenError('User is not a member of this room');
    }

    const match = await this.matchRepository.findById(matchId);
    if (!match || match.roomId !== room.id) {
      throw new NotFoundError('Match not found in this room');
    }

    const trimmedWinner = predictedWinner.trim();
    if (trimmedWinner !== match.homeTeam && trimmedWinner !== match.awayTeam) {
      throw new ValidationError(`Predicted winner must be either '${match.homeTeam}' or '${match.awayTeam}'`);
    }

    const bet = await this.betRepository.upsert({
      roomId: room.id,
      matchId: match.id,
      userId,
      predictedWinner: trimmedWinner
    });

    return bet.toJSON();
  }
}

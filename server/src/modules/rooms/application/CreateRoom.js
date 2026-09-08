import { ValidationError } from '../../../shared/domain/errors/index.js';
import crypto from 'crypto';

export class CreateRoom {
  constructor({ roomRepository, matchRepository, sportEngine }) {
    this.roomRepository = roomRepository;
    this.matchRepository = matchRepository;
    this.sportEngine = sportEngine;
  }

  _generateCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    const bytes = crypto.randomBytes(6);
    for (let i = 0; i < 6; i++) {
      code += chars[bytes[i] % chars.length];
    }
    return code;
  }

  async execute({ name, maxUsers, creatorId }) {
    if (!name || typeof name !== 'string' || !name.trim()) {
      throw new ValidationError('Room name is required');
    }

    const parsedMaxUsers = parseInt(maxUsers, 10);
    if (isNaN(parsedMaxUsers) || parsedMaxUsers < 2) {
      throw new ValidationError('Maximum users must be at least 2');
    }

    let code;
    let attempts = 0;
    while (attempts < 10) {
      const candidateCode = this._generateCode();
      const existing = await this.roomRepository.findByCode(candidateCode);
      if (!existing) {
        code = candidateCode;
        break;
      }
      attempts++;
    }

    if (!code) {
      throw new Error('Could not generate unique room code');
    }

    // 1. Create room
    const room = await this.roomRepository.create({
      name: name.trim(),
      code,
      creatorId,
      maxUsers: parsedMaxUsers
    });

    // 2. Add creator as active member
    await this.roomRepository.addMember(room.id, creatorId);

    // 3. Generate 28 matches using SportEngine (Task 4.2 & 4.4)
    const selectedTeams = this.sportEngine.selectTeams(8);
    const schedule = this.sportEngine.generateSchedule(selectedTeams);

    const matchesToInsert = schedule.map((item) => ({
      roomId: room.id,
      round: item.round,
      homeTeam: item.homeTeam,
      awayTeam: item.awayTeam
    }));

    await this.matchRepository.createMany(matchesToInsert);

    const fullRoom = await this.roomRepository.findById(room.id);
    return fullRoom.toJSON();
  }
}

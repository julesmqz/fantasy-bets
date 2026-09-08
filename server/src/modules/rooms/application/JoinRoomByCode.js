import { NotFoundError, ConflictError, ForbiddenError, ValidationError } from '../../../shared/domain/errors/index.js';

export class JoinRoomByCode {
  constructor({ roomRepository }) {
    this.roomRepository = roomRepository;
  }

  async execute({ code, userId }) {
    if (!code || typeof code !== 'string') {
      throw new ValidationError('Room code is required');
    }

    const trimmedCode = code.trim().toUpperCase();
    const room = await this.roomRepository.findByCode(trimmedCode);
    if (!room) {
      throw new NotFoundError('Room not found with provided code');
    }

    // Check if already a member
    const alreadyMember = await this.roomRepository.isMember(room.id, userId);
    if (alreadyMember) {
      return room.toJSON();
    }

    // Check if room is completed
    if (room.isCompleted()) {
      throw new ForbiddenError('Cannot join a completed room');
    }

    // Check capacity
    const currentCount = await this.roomRepository.countMembers(room.id);
    if (currentCount >= room.maxUsers) {
      throw new ConflictError('Room has reached maximum capacity');
    }

    await this.roomRepository.addMember(room.id, userId);
    const updatedRoom = await this.roomRepository.findById(room.id);
    return updatedRoom.toJSON();
  }
}

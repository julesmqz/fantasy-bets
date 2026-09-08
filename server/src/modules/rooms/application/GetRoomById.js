import { NotFoundError } from '../../../shared/domain/errors/index.js';

export class GetRoomById {
  constructor({ roomRepository }) {
    this.roomRepository = roomRepository;
  }

  async execute({ roomId, userId }) {
    const room = await this.roomRepository.findById(roomId);
    if (!room) {
      throw new NotFoundError('Room not found');
    }

    const members = await this.roomRepository.findMembersByRoomId(roomId);
    const isMember = await this.roomRepository.isMember(roomId, userId);

    return {
      ...room.toJSON(),
      isMember,
      isCreator: room.creatorId === userId,
      members: members.map((m) => m.toJSON())
    };
  }
}

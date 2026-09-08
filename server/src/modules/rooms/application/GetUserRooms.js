export class GetUserRooms {
  constructor({ roomRepository }) {
    this.roomRepository = roomRepository;
  }

  async execute({ userId }) {
    return this.roomRepository.findRoomsByUserId(userId);
  }
}

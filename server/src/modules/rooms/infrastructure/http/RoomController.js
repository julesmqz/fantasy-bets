export class RoomController {
  constructor({ createRoom, joinRoomByCode, getUserRooms, getRoomById, getRoomMatches }) {
    this.createRoom = createRoom;
    this.joinRoomByCode = joinRoomByCode;
    this.getUserRooms = getUserRooms;
    this.getRoomById = getRoomById;
    this.getRoomMatches = getRoomMatches;
  }

  create = async (req, res, next) => {
    try {
      const { name, max_users } = req.body;
      const room = await this.createRoom.execute({
        name,
        maxUsers: max_users,
        creatorId: req.user.id
      });
      return res.status(201).json({ room });
    } catch (error) {
      next(error);
    }
  };

  join = async (req, res, next) => {
    try {
      const { code } = req.body;
      const room = await this.joinRoomByCode.execute({
        code,
        userId: req.user.id
      });
      return res.status(200).json({ room });
    } catch (error) {
      next(error);
    }
  };

  myRooms = async (req, res, next) => {
    try {
      const rooms = await this.getUserRooms.execute({
        userId: req.user.id
      });
      return res.status(200).json({ rooms });
    } catch (error) {
      next(error);
    }
  };

  getById = async (req, res, next) => {
    try {
      const roomId = req.params.roomId;
      const room = await this.getRoomById.execute({
        roomId,
        userId: req.user.id
      });
      return res.status(200).json({ room });
    } catch (error) {
      next(error);
    }
  };

  getMatches = async (req, res, next) => {
    try {
      const roomId = req.params.roomId;
      const matches = await this.getRoomMatches.execute({
        roomId
      });
      return res.status(200).json({ matches });
    } catch (error) {
      next(error);
    }
  };
}

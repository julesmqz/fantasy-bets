export class BetController {
  constructor({ placeOrUpdateBet, getUserRoomBets, getLeaderboard, simulateAndSettleRoom }) {
    this.placeOrUpdateBetUseCase = placeOrUpdateBet;
    this.getUserRoomBetsUseCase = getUserRoomBets;
    this.getLeaderboardUseCase = getLeaderboard;
    this.simulateAndSettleRoomUseCase = simulateAndSettleRoom;
  }

  placeBet = async (req, res, next) => {
    try {
      const roomId = parseInt(req.params.roomId, 10);
      const { match_id, predicted_winner } = req.body;
      const bet = await this.placeOrUpdateBetUseCase.execute({
        roomId,
        matchId: match_id,
        userId: req.user.id,
        predictedWinner: predicted_winner
      });
      return res.status(200).json({ bet });
    } catch (error) {
      next(error);
    }
  };

  getMyBets = async (req, res, next) => {
    try {
      const roomId = parseInt(req.params.roomId, 10);
      const bets = await this.getUserRoomBetsUseCase.execute({
        roomId,
        userId: req.user.id
      });
      return res.status(200).json({ bets });
    } catch (error) {
      next(error);
    }
  };

  simulate = async (req, res, next) => {
    try {
      const roomId = parseInt(req.params.roomId, 10);
      const room = await this.simulateAndSettleRoomUseCase.execute({
        roomId,
        userId: req.user.id
      });
      return res.status(200).json({ room });
    } catch (error) {
      next(error);
    }
  };

  getLeaderboard = async (req, res, next) => {
    try {
      const roomId = parseInt(req.params.roomId, 10);
      const leaderboard = await this.getLeaderboardUseCase.execute({
        roomId
      });
      return res.status(200).json({ leaderboard });
    } catch (error) {
      next(error);
    }
  };
}

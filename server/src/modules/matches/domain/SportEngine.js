/**
 * SportEngine Domain Interface
 */
export class SportEngine {
  getTeamsPool() {
    throw new Error('Not implemented');
  }

  selectTeams(count) {
    throw new Error('Not implemented');
  }

  generateSchedule(teams) {
    throw new Error('Not implemented');
  }

  simulateWinner(match) {
    throw new Error('Not implemented');
  }
}

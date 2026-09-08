import { SportEngine } from '../domain/SportEngine.js';
import { RoundRobinService } from './RoundRobinService.js';

export class LigaMXSoccerEngine extends SportEngine {
  constructor() {
    super();
    this.teamsPool = [
      'Club América',
      'CD Guadalajara',
      'Cruz Azul',
      'Tigres UANL',
      'CF Monterrey',
      'Deportivo Toluca',
      'Pumas UNAM',
      'CF Pachuca',
      'Club León'
    ];
  }

  getTeamsPool() {
    return [...this.teamsPool];
  }

  /**
   * Randomly selects `count` teams from the pool.
   * Default count is 8.
   */
  selectTeams(count = 8) {
    if (count > this.teamsPool.length) {
      throw new Error(`Cannot select ${count} teams from a pool of ${this.teamsPool.length}`);
    }

    const shuffled = [...this.teamsPool].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  /**
   * Generates 7 rounds with 4 matches each (28 matches total)
   */
  generateSchedule(teams) {
    return RoundRobinService.generateSchedule(teams);
  }

  /**
   * Simulates the winner of a match pseudo-randomly
   * @param {{ homeTeam: string, awayTeam: string }} match
   * @returns {string} winning team
   */
  simulateWinner(match) {
    const isHomeWinner = Math.random() >= 0.5;
    return isHomeWinner ? match.homeTeam : match.awayTeam;
  }
}

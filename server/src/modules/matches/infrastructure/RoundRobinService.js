export class RoundRobinService {
  /**
   * Generates a round-robin schedule for an even number of teams using the circle method.
   * @param {string[]} teams - Array of team names (must be even length, e.g. 8)
   * @returns {Array<{ round: number, homeTeam: string, awayTeam: string }>}
   */
  static generateSchedule(teams) {
    if (teams.length % 2 !== 0) {
      throw new Error('Number of teams must be even for Round Robin generation');
    }

    const n = teams.length;
    const roundsCount = n - 1;
    const matchesPerRound = n / 2;
    const schedule = [];

    // Working array of team indices or objects
    const list = [...teams];

    for (let round = 1; round <= roundsCount; round++) {
      for (let i = 0; i < matchesPerRound; i++) {
        let home = list[i];
        let away = list[n - 1 - i];

        // Alternate home/away for the fixed team (index 0) to balance home/away games
        if (i === 0 && round % 2 === 0) {
          [home, away] = [away, home];
        }

        schedule.push({
          round,
          homeTeam: home,
          awayTeam: away
        });
      }

      // Rotate list keeping list[0] fixed and shifting the rest clockwise
      const fixed = list[0];
      const rotating = list.slice(1);
      const last = rotating.pop();
      rotating.unshift(last);
      list.splice(0, list.length, fixed, ...rotating);
    }

    return schedule;
  }
}

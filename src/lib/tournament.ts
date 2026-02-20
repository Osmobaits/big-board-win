export interface Player {
  id: string;
  name: string;
}

export interface TournamentMatch {
  id: string;
  round: number;
  playerA: Player;
  playerB: Player;
  winner: string | null; // player name
  isDraw: boolean;
  played: boolean;
}

export interface TournamentStanding {
  player: Player;
  wins: number;
  draws: number;
  losses: number;
  points: number;
}

export const generateRoundRobinMatches = (players: Player[], rounds: number = 1): TournamentMatch[] => {
  const matches: TournamentMatch[] = [];
  for (let round = 0; round < rounds; round++) {
    for (let i = 0; i < players.length; i++) {
      for (let j = i + 1; j < players.length; j++) {
        // Swap A/B on odd rounds so players alternate starting side
        const isSwapped = round % 2 === 1;
        matches.push({
          id: `${players[i].id}-vs-${players[j].id}-r${round}`,
          round: round + 1,
          playerA: isSwapped ? players[j] : players[i],
          playerB: isSwapped ? players[i] : players[j],
          winner: null,
          isDraw: false,
          played: false,
        });
      }
    }
  }
  return matches;
};

export const calculateStandings = (players: Player[], matches: TournamentMatch[]): TournamentStanding[] => {
  const standingsMap = new Map<string, TournamentStanding>();
  
  players.forEach((p) => {
    standingsMap.set(p.name, { player: p, wins: 0, draws: 0, losses: 0, points: 0 });
  });

  matches.filter((m) => m.played).forEach((m) => {
    if (m.isDraw) {
      standingsMap.get(m.playerA.name)!.draws++;
      standingsMap.get(m.playerB.name)!.draws++;
      standingsMap.get(m.playerA.name)!.points++;
      standingsMap.get(m.playerB.name)!.points++;
    } else if (m.winner) {
      const loser = m.winner === m.playerA.name ? m.playerB.name : m.playerA.name;
      standingsMap.get(m.winner)!.wins++;
      standingsMap.get(m.winner)!.points += 3;
      standingsMap.get(loser)!.losses++;
    }
  });

  return Array.from(standingsMap.values()).sort((a, b) => b.points - a.points || b.wins - a.wins);
};

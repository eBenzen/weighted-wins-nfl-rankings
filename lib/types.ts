/**
 * TypeScript type definitions for NFL Weighted Wins data
 */

export interface TeamRanking {
  team: string; // Team abbreviation (e.g., "BUF", "KC")
  wins: number;
  losses: number;
  ties: number;
  win_pct: number; // Win percentage (0.0 - 1.0)
  weighted_wins: number; // Sum of opponents' wins for games won
  weighted_losses: number; // Negative sum of opponents' losses for games lost
  total: number; // WW + WL combined score
}

export interface WeekData {
  timestamp: string; // ISO-8601 timestamp
  week: number; // NFL week number
  season: number; // NFL season year
  rankings: TeamRanking[]; // Array of team rankings sorted by total score
}

export interface Game {
  opponent: string; // Opponent team abbreviation
  result: 'W' | 'L' | 'T'; // Game result
  opponent_record: {
    wins: number;
    losses: number;
    ties: number;
  };
  weighted_value: number; // Contribution to weighted score
}

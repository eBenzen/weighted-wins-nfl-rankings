/**
 * NFL Team data and logo utilities
 */

export interface NFLTeam {
  abbr: string;
  name: string;
  fullName: string;
  primaryColor: string;
  secondaryColor: string;
}

// NFL team data with colors for styling
export const NFL_TEAMS: Record<string, NFLTeam> = {
  ARI: { abbr: 'ARI', name: 'Cardinals', fullName: 'Arizona Cardinals', primaryColor: '#97233F', secondaryColor: '#FFB612' },
  ATL: { abbr: 'ATL', name: 'Falcons', fullName: 'Atlanta Falcons', primaryColor: '#A71930', secondaryColor: '#000000' },
  BAL: { abbr: 'BAL', name: 'Ravens', fullName: 'Baltimore Ravens', primaryColor: '#241773', secondaryColor: '#000000' },
  BUF: { abbr: 'BUF', name: 'Bills', fullName: 'Buffalo Bills', primaryColor: '#00338D', secondaryColor: '#C60C30' },
  CAR: { abbr: 'CAR', name: 'Panthers', fullName: 'Carolina Panthers', primaryColor: '#0085CA', secondaryColor: '#101820' },
  CHI: { abbr: 'CHI', name: 'Bears', fullName: 'Chicago Bears', primaryColor: '#0B162A', secondaryColor: '#C83803' },
  CIN: { abbr: 'CIN', name: 'Bengals', fullName: 'Cincinnati Bengals', primaryColor: '#FB4F14', secondaryColor: '#000000' },
  CLE: { abbr: 'CLE', name: 'Browns', fullName: 'Cleveland Browns', primaryColor: '#311D00', secondaryColor: '#FF3C00' },
  DAL: { abbr: 'DAL', name: 'Cowboys', fullName: 'Dallas Cowboys', primaryColor: '#003594', secondaryColor: '#869397' },
  DEN: { abbr: 'DEN', name: 'Broncos', fullName: 'Denver Broncos', primaryColor: '#FB4F14', secondaryColor: '#002244' },
  DET: { abbr: 'DET', name: 'Lions', fullName: 'Detroit Lions', primaryColor: '#0076B6', secondaryColor: '#B0B7BC' },
  GB: { abbr: 'GB', name: 'Packers', fullName: 'Green Bay Packers', primaryColor: '#203731', secondaryColor: '#FFB612' },
  HOU: { abbr: 'HOU', name: 'Texans', fullName: 'Houston Texans', primaryColor: '#03202F', secondaryColor: '#A71930' },
  IND: { abbr: 'IND', name: 'Colts', fullName: 'Indianapolis Colts', primaryColor: '#002C5F', secondaryColor: '#A2AAAD' },
  JAX: { abbr: 'JAX', name: 'Jaguars', fullName: 'Jacksonville Jaguars', primaryColor: '#006778', secondaryColor: '#D7A22A' },
  KC: { abbr: 'KC', name: 'Chiefs', fullName: 'Kansas City Chiefs', primaryColor: '#E31837', secondaryColor: '#FFB81C' },
  LA: { abbr: 'LA', name: 'Rams', fullName: 'Los Angeles Rams', primaryColor: '#003594', secondaryColor: '#FFA300' },
  LAC: { abbr: 'LAC', name: 'Chargers', fullName: 'Los Angeles Chargers', primaryColor: '#0080C6', secondaryColor: '#FFC20E' },
  LV: { abbr: 'LV', name: 'Raiders', fullName: 'Las Vegas Raiders', primaryColor: '#000000', secondaryColor: '#A5ACAF' },
  MIA: { abbr: 'MIA', name: 'Dolphins', fullName: 'Miami Dolphins', primaryColor: '#008E97', secondaryColor: '#FC4C02' },
  MIN: { abbr: 'MIN', name: 'Vikings', fullName: 'Minnesota Vikings', primaryColor: '#4F2683', secondaryColor: '#FFC62F' },
  NE: { abbr: 'NE', name: 'Patriots', fullName: 'New England Patriots', primaryColor: '#002244', secondaryColor: '#C60C30' },
  NO: { abbr: 'NO', name: 'Saints', fullName: 'New Orleans Saints', primaryColor: '#D3BC8D', secondaryColor: '#101820' },
  NYG: { abbr: 'NYG', name: 'Giants', fullName: 'New York Giants', primaryColor: '#0B2265', secondaryColor: '#A71930' },
  NYJ: { abbr: 'NYJ', name: 'Jets', fullName: 'New York Jets', primaryColor: '#125740', secondaryColor: '#000000' },
  PHI: { abbr: 'PHI', name: 'Eagles', fullName: 'Philadelphia Eagles', primaryColor: '#004C54', secondaryColor: '#A5ACAF' },
  PIT: { abbr: 'PIT', name: 'Steelers', fullName: 'Pittsburgh Steelers', primaryColor: '#FFB612', secondaryColor: '#101820' },
  SEA: { abbr: 'SEA', name: 'Seahawks', fullName: 'Seattle Seahawks', primaryColor: '#002244', secondaryColor: '#69BE28' },
  SF: { abbr: 'SF', name: '49ers', fullName: 'San Francisco 49ers', primaryColor: '#AA0000', secondaryColor: '#B3995D' },
  TB: { abbr: 'TB', name: 'Buccaneers', fullName: 'Tampa Bay Buccaneers', primaryColor: '#D50A0A', secondaryColor: '#FF7900' },
  TEN: { abbr: 'TEN', name: 'Titans', fullName: 'Tennessee Titans', primaryColor: '#0C2340', secondaryColor: '#4B92DB' },
  WAS: { abbr: 'WAS', name: 'Commanders', fullName: 'Washington Commanders', primaryColor: '#5A1414', secondaryColor: '#FFB612' },
};

/**
 * Get team logo URL from ESPN's CDN
 * @param teamAbbr - Team abbreviation (e.g., "KC", "BUF")
 * @param size - Logo size (default: 500)
 * @returns URL to team logo image
 */
export function getTeamLogoUrl(teamAbbr: string, size: number = 500): string {
  // ESPN uses different abbreviations for some teams
  const espnMapping: Record<string, string> = {
    'LA': 'LAR',  // Rams
    'LV': 'LV',   // Raiders (already correct)
  };

  const espnAbbr = espnMapping[teamAbbr] || teamAbbr;

  // ESPN's CDN for NFL team logos (free to use for display purposes)
  return `https://a.espncdn.com/i/teamlogos/nfl/500/${espnAbbr.toLowerCase()}.png`;
}

/**
 * Get team data by abbreviation
 * @param teamAbbr - Team abbreviation
 * @returns Team data object or undefined
 */
export function getTeamData(teamAbbr: string): NFLTeam | undefined {
  return NFL_TEAMS[teamAbbr.toUpperCase()];
}

/**
 * Get all team abbreviations
 * @returns Array of all team abbreviations
 */
export function getAllTeamAbbreviations(): string[] {
  return Object.keys(NFL_TEAMS);
}

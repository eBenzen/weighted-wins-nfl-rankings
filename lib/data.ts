/**
 * Utility functions for reading and managing NFL Weighted Wins data
 */

import { promises as fs } from 'fs';
import path from 'path';
import type { WeekData, TeamRanking } from './types';

const DATA_DIR = path.join(process.cwd(), 'data');

/**
 * Get the latest available week's data
 * @returns Promise resolving to the most recent week's data, or null if none found
 */
export async function getLatestWeekData(): Promise<WeekData | null> {
  try {
    const files = await fs.readdir(DATA_DIR);

    // Filter for week_*.json files
    const weekFiles = files
      .filter(file => file.match(/^week_\d+\.json$/))
      .sort((a, b) => {
        const weekA = parseInt(a.match(/\d+/)?.[0] || '0');
        const weekB = parseInt(b.match(/\d+/)?.[0] || '0');
        return weekB - weekA; // Sort descending
      });

    if (weekFiles.length === 0) {
      return null;
    }

    // Read the most recent week file
    return await getWeekData(parseInt(weekFiles[0].match(/\d+/)?.[0] || '0'));
  } catch (error) {
    console.error('Error reading latest week data:', error);
    return null;
  }
}

/**
 * Get data for a specific week
 * @param weekNumber - The week number to retrieve
 * @returns Promise resolving to the week's data, or null if not found
 */
export async function getWeekData(weekNumber: number): Promise<WeekData | null> {
  try {
    // Validate input
    if (!weekNumber || weekNumber < 1 || weekNumber > 18) {
      console.warn(`Invalid week number: ${weekNumber}`);
      return null;
    }

    const filePath = path.join(DATA_DIR, `week_${weekNumber}.json`);
    const fileContent = await fs.readFile(filePath, 'utf-8');

    // Validate JSON parsing
    let data: WeekData;
    try {
      data = JSON.parse(fileContent) as WeekData;
    } catch (parseError) {
      console.error(`JSON parse error for week ${weekNumber}:`, parseError);
      return null;
    }

    // Validate the data structure
    if (!data.rankings || !Array.isArray(data.rankings)) {
      console.error(`Invalid data structure for week ${weekNumber}: rankings array missing`);
      return null;
    }

    // Validate required fields
    if (!data.timestamp || !data.week || !data.season) {
      console.error(`Invalid data structure for week ${weekNumber}: missing required fields`);
      return null;
    }

    // Validate each team ranking has required fields
    const isValid = data.rankings.every(ranking =>
      ranking.team &&
      typeof ranking.wins === 'number' &&
      typeof ranking.losses === 'number' &&
      typeof ranking.ties === 'number' &&
      typeof ranking.win_pct === 'number' &&
      typeof ranking.weighted_wins === 'number' &&
      typeof ranking.weighted_losses === 'number' &&
      typeof ranking.total === 'number'
    );

    if (!isValid) {
      console.error(`Invalid team ranking data for week ${weekNumber}`);
      return null;
    }

    return data;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      // File not found is expected for future weeks
      return null;
    }
    console.error(`Error reading week ${weekNumber} data:`, error);
    return null;
  }
}

/**
 * Get all available weeks of data
 * @returns Promise resolving to an array of all week data, sorted by week number
 */
export async function getAllWeeks(): Promise<WeekData[]> {
  try {
    const files = await fs.readdir(DATA_DIR);

    // Find all week_*.json files
    const weekFiles = files
      .filter(file => file.match(/^week_\d+\.json$/))
      .map(file => parseInt(file.match(/\d+/)?.[0] || '0'))
      .sort((a, b) => a - b); // Sort ascending

    // Read all week files
    const weekDataPromises = weekFiles.map(weekNum => getWeekData(weekNum));
    const weekDataResults = await Promise.all(weekDataPromises);

    // Filter out null results (failed reads)
    return weekDataResults.filter((data): data is WeekData => data !== null);
  } catch (error) {
    console.error('Error reading all weeks data:', error);
    return [];
  }
}

/**
 * Get a specific team's ranking from week data
 * @param weekData - The week data to search
 * @param teamAbbr - Team abbreviation (e.g., "BUF")
 * @returns The team's ranking data, or null if not found
 */
export function getTeamRanking(
  weekData: WeekData,
  teamAbbr: string
): TeamRanking | null {
  return weekData.rankings.find(
    ranking => ranking.team === teamAbbr.toUpperCase()
  ) || null;
}

/**
 * Sort rankings by a specific field
 * @param rankings - Array of team rankings to sort
 * @param field - Field name to sort by
 * @param direction - Sort direction ('asc' or 'desc')
 * @returns Sorted array of rankings
 */
export function sortRankings(
  rankings: TeamRanking[],
  field: keyof TeamRanking,
  direction: 'asc' | 'desc' = 'desc'
): TeamRanking[] {
  return [...rankings].sort((a, b) => {
    const aValue = a[field];
    const bValue = b[field];

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return direction === 'desc' ? bValue - aValue : aValue - bValue;
    }

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return direction === 'desc'
        ? bValue.localeCompare(aValue)
        : aValue.localeCompare(bValue);
    }

    return 0;
  });
}

/**
 * Get the rank (1-indexed position) of a team
 * @param weekData - The week data
 * @param teamAbbr - Team abbreviation
 * @returns Rank number (1-based), or null if team not found
 */
export function getTeamRank(weekData: WeekData, teamAbbr: string): number | null {
  const index = weekData.rankings.findIndex(
    ranking => ranking.team === teamAbbr.toUpperCase()
  );
  return index === -1 ? null : index + 1;
}

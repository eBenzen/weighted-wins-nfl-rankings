#!/usr/bin/env python3
"""
NFL Weighted Wins Calculator

This script fetches NFL game data and calculates weighted wins/losses rankings
for all teams, outputting the results as JSON files for the Next.js frontend.
"""

import json
import logging
import os
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, List, Any, Optional

import pandas as pd
import nfl_data_py as nfl


# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Constants
CURRENT_SEASON = 2025
MAX_RETRIES = 3
RETRY_DELAY = 2  # seconds


def fetch_nfl_data(season: int = CURRENT_SEASON) -> Optional[pd.DataFrame]:
    """
    Fetch NFL schedule data for the specified season with retry logic.

    Args:
        season: The NFL season year to fetch data for

    Returns:
        DataFrame containing schedule data, or None if fetch fails
    """
    for attempt in range(MAX_RETRIES):
        try:
            logger.info(f"Fetching NFL schedule data for {season} season (attempt {attempt + 1}/{MAX_RETRIES})")
            schedule = nfl.import_schedules([season])

            if schedule is None or schedule.empty:
                logger.warning(f"No schedule data returned for {season} season")
                return None

            logger.info(f"Successfully fetched {len(schedule)} games")
            return schedule

        except Exception as e:
            logger.warning(f"Attempt {attempt + 1} failed: {e}")
            if attempt < MAX_RETRIES - 1:
                wait_time = RETRY_DELAY * (2 ** attempt)  # Exponential backoff
                logger.info(f"Retrying in {wait_time} seconds...")
                time.sleep(wait_time)
            else:
                logger.error(f"Failed to fetch NFL data after {MAX_RETRIES} attempts")
                return None

    return None


def get_game_results(schedule: pd.DataFrame) -> pd.DataFrame:
    """
    Filter schedule data to only include completed games with results.

    Args:
        schedule: Full schedule DataFrame

    Returns:
        DataFrame containing only completed games
    """
    logger.info("Filtering for completed games...")

    # Filter for games where home_score is not null (game has been played)
    completed = schedule[schedule['home_score'].notna()].copy()

    logger.info(f"Found {len(completed)} completed games")
    return completed


def get_current_week(schedule: pd.DataFrame) -> int:
    """
    Determine the latest completed week number.

    Args:
        schedule: Schedule DataFrame

    Returns:
        Latest completed week number
    """
    completed = get_game_results(schedule)

    if completed.empty:
        logger.warning("No completed games found")
        return 0

    current_week = int(completed['week'].max())
    logger.info(f"Current completed week: {current_week}")
    return current_week


def validate_data(schedule: pd.DataFrame) -> bool:
    """
    Validate that the schedule data has all required fields.

    Args:
        schedule: Schedule DataFrame to validate

    Returns:
        True if data is valid, False otherwise
    """
    required_fields = [
        'week', 'home_team', 'away_team',
        'home_score', 'away_score', 'result'
    ]

    missing_fields = [field for field in required_fields if field not in schedule.columns]

    if missing_fields:
        logger.error(f"Missing required fields: {missing_fields}")
        return False

    logger.info("Data validation passed")
    return True


def get_team_record(schedule: pd.DataFrame, team: str, through_week: int = None) -> Dict[str, int]:
    """
    Calculate a team's current win/loss/tie record.

    Args:
        schedule: Schedule DataFrame with completed games
        team: Team abbreviation
        through_week: Optional week limit (calculates through this week)

    Returns:
        Dictionary with 'wins', 'losses', 'ties'
    """
    completed = get_game_results(schedule)

    if through_week:
        completed = completed[completed['week'] <= through_week]

    # Count wins
    wins = len(completed[
        ((completed['home_team'] == team) & (completed['result'] > 0)) |
        ((completed['away_team'] == team) & (completed['result'] < 0))
    ])

    # Count losses
    losses = len(completed[
        ((completed['home_team'] == team) & (completed['result'] < 0)) |
        ((completed['away_team'] == team) & (completed['result'] > 0))
    ])

    # Count ties
    ties = len(completed[
        ((completed['home_team'] == team) | (completed['away_team'] == team)) &
        (completed['result'] == 0)
    ])

    return {'wins': wins, 'losses': losses, 'ties': ties}


def calculate_win_percentage(wins: int, losses: int, ties: int) -> float:
    """
    Calculate win percentage (ties count as 0.5 wins).

    Args:
        wins: Number of wins
        losses: Number of losses
        ties: Number of ties

    Returns:
        Win percentage as decimal
    """
    total_games = wins + losses + ties
    if total_games == 0:
        return 0.0

    return (wins + 0.5 * ties) / total_games


def calculate_weighted_wins(schedule: pd.DataFrame, team: str) -> float:
    """
    Calculate weighted wins for a team by summing opponents' current win totals
    for all games this team won.

    Args:
        schedule: Schedule DataFrame
        team: Team abbreviation

    Returns:
        Weighted wins score
    """
    completed = get_game_results(schedule)

    # Get all games this team won
    team_wins = completed[
        ((completed['home_team'] == team) & (completed['result'] > 0)) |
        ((completed['away_team'] == team) & (completed['result'] < 0))
    ]

    weighted_wins = 0.0

    for _, game in team_wins.iterrows():
        # Determine opponent
        opponent = game['away_team'] if game['home_team'] == team else game['home_team']

        # Get opponent's current record
        opp_record = get_team_record(schedule, opponent)

        # Add opponent's wins to weighted wins
        weighted_wins += opp_record['wins']

    logger.debug(f"{team} weighted wins: {weighted_wins}")
    return weighted_wins


def calculate_weighted_losses(schedule: pd.DataFrame, team: str) -> float:
    """
    Calculate weighted losses for a team by summing the negative of opponents'
    current loss totals for all games this team lost.

    Args:
        schedule: Schedule DataFrame
        team: Team abbreviation

    Returns:
        Weighted losses score (will be negative)
    """
    completed = get_game_results(schedule)

    # Get all games this team lost
    team_losses = completed[
        ((completed['home_team'] == team) & (completed['result'] < 0)) |
        ((completed['away_team'] == team) & (completed['result'] > 0))
    ]

    weighted_losses = 0.0

    for _, game in team_losses.iterrows():
        # Determine opponent
        opponent = game['away_team'] if game['home_team'] == team else game['home_team']

        # Get opponent's current record
        opp_record = get_team_record(schedule, opponent)

        # Subtract opponent's losses (negative contribution)
        weighted_losses -= opp_record['losses']

    logger.debug(f"{team} weighted losses: {weighted_losses}")
    return weighted_losses


def calculate_total_score(weighted_wins: float, weighted_losses: float) -> float:
    """
    Calculate total weighted score (WW + WL).

    Args:
        weighted_wins: Weighted wins value
        weighted_losses: Weighted losses value (negative)

    Returns:
        Total score
    """
    return weighted_wins + weighted_losses


def calculate_all_rankings(schedule: pd.DataFrame) -> List[Dict[str, Any]]:
    """
    Calculate rankings for all NFL teams.

    Args:
        schedule: Schedule DataFrame

    Returns:
        List of team ranking dictionaries
    """
    # Get all unique teams
    completed = get_game_results(schedule)
    teams = set(completed['home_team'].unique()) | set(completed['away_team'].unique())

    rankings = []

    for team in sorted(teams):
        logger.info(f"Calculating rankings for {team}...")

        record = get_team_record(schedule, team)
        win_pct = calculate_win_percentage(record['wins'], record['losses'], record['ties'])
        weighted_wins = calculate_weighted_wins(schedule, team)
        weighted_losses = calculate_weighted_losses(schedule, team)
        total = calculate_total_score(weighted_wins, weighted_losses)

        rankings.append({
            'team': team,
            'wins': record['wins'],
            'losses': record['losses'],
            'ties': record['ties'],
            'win_pct': round(win_pct, 3),
            'weighted_wins': round(weighted_wins, 2),
            'weighted_losses': round(weighted_losses, 2),
            'total': round(total, 2)
        })

    # Sort by total score descending
    rankings.sort(key=lambda x: x['total'], reverse=True)

    return rankings


def format_team_ranking(team_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Format individual team ranking data according to the required schema.

    Args:
        team_data: Raw team ranking data

    Returns:
        Formatted team ranking dictionary
    """
    return {
        'team': team_data['team'],
        'wins': team_data['wins'],
        'losses': team_data['losses'],
        'ties': team_data['ties'],
        'win_pct': team_data['win_pct'],
        'weighted_wins': team_data['weighted_wins'],
        'weighted_losses': team_data['weighted_losses'],
        'total': team_data['total']
    }


def format_week_data(week: int, rankings: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Build complete JSON structure with timestamp, week, and rankings array.

    Args:
        week: Week number
        rankings: List of team ranking dictionaries

    Returns:
        Complete week data structure
    """
    formatted_rankings = [format_team_ranking(team) for team in rankings]

    return {
        'timestamp': datetime.now(timezone.utc).isoformat(),
        'week': week,
        'season': CURRENT_SEASON,
        'rankings': formatted_rankings
    }


def save_json_snapshot(data: Dict[str, Any], week: int, output_dir: str = 'data') -> bool:
    """
    Write JSON data to /data/week_X.json with proper error handling and backup.

    Args:
        data: Week data to save
        week: Week number
        output_dir: Output directory path

    Returns:
        True if save was successful, False otherwise
    """
    try:
        # Create output directory if it doesn't exist
        output_path = Path(output_dir)
        output_path.mkdir(parents=True, exist_ok=True)

        # Define file paths
        output_file = output_path / f'week_{week}.json'
        backup_file = output_path / f'week_{week}.json.backup'

        # Create backup if file exists
        if output_file.exists():
            logger.info(f"Creating backup of existing {output_file.name}")
            try:
                import shutil
                shutil.copy2(output_file, backup_file)
            except Exception as e:
                logger.warning(f"Failed to create backup: {e}")

        # Write JSON file with proper formatting
        logger.info(f"Writing data to {output_file}")
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)

        # Verify file was written correctly
        if output_file.exists():
            file_size = output_file.stat().st_size
            logger.info(f"Successfully wrote {file_size} bytes to {output_file}")

            # Verify JSON is valid by reading it back
            with open(output_file, 'r', encoding='utf-8') as f:
                json.load(f)

            logger.info("JSON validation successful")
            return True
        else:
            logger.error(f"File {output_file} was not created")
            return False

    except json.JSONDecodeError as e:
        logger.error(f"JSON validation failed: {e}")
        # Restore from backup if available
        if backup_file.exists():
            logger.info("Restoring from backup")
            shutil.copy2(backup_file, output_file)
        return False

    except Exception as e:
        logger.error(f"Error saving JSON file: {e}", exc_info=True)
        return False


def main():
    """Main entry point for the rankings calculation script."""
    logger.info("Starting NFL Weighted Wins calculation...")

    try:
        # Fetch NFL data
        schedule = fetch_nfl_data(CURRENT_SEASON)

        if schedule is None:
            logger.error("Failed to fetch NFL data. Exiting.")
            return

        # Validate data
        if not validate_data(schedule):
            logger.error("Data validation failed. Exiting.")
            return

        # Get current week
        current_week = get_current_week(schedule)

        if current_week < 2:
            logger.info(f"Current week is {current_week}. Calculations start after Week 2. Exiting.")
            return

        logger.info(f"Data fetching complete. Calculating rankings for Week {current_week}...")

        # Calculate rankings
        rankings = calculate_all_rankings(schedule)

        logger.info(f"\n{'='*60}")
        logger.info(f"NFL Weighted Wins Rankings - Week {current_week}")
        logger.info(f"{'='*60}")
        logger.info(f"{'Rank':<6}{'Team':<6}{'W-L-T':<10}{'Win%':<8}{'WW':<8}{'WL':<8}{'Total':<8}")
        logger.info(f"{'-'*60}")

        for i, team_data in enumerate(rankings[:10], 1):  # Show top 10
            record = f"{team_data['wins']}-{team_data['losses']}-{team_data['ties']}"
            logger.info(
                f"{i:<6}{team_data['team']:<6}{record:<10}"
                f"{team_data['win_pct']:<8.3f}{team_data['weighted_wins']:<8.2f}"
                f"{team_data['weighted_losses']:<8.2f}{team_data['total']:<8.2f}"
            )

        logger.info(f"{'='*60}")

        # Format and save JSON output
        logger.info("\nFormatting data for JSON output...")
        week_data = format_week_data(current_week, rankings)

        logger.info(f"Saving JSON snapshot for Week {current_week}...")
        if save_json_snapshot(week_data, current_week):
            logger.info(f"✓ Successfully saved data/week_{current_week}.json")
        else:
            logger.error(f"✗ Failed to save JSON output")
            return

        logger.info("Calculation complete!")

    except Exception as e:
        logger.error(f"Error during calculation: {e}", exc_info=True)
        raise


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""
Unit tests for NFL Weighted Wins Calculator
Tests all calculation functions with mock data fixtures
"""

import json
import pytest
import pandas as pd
from pathlib import Path
from datetime import datetime, timezone
import sys
import os

# Add scripts directory to path for imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'scripts'))

from calculate_rankings import (
    get_game_results,
    get_current_week,
    validate_data,
    get_team_record,
    calculate_win_percentage,
    calculate_weighted_wins,
    calculate_weighted_losses,
    calculate_total_score,
    calculate_all_rankings,
    format_team_ranking,
    format_week_data,
)


# ============================================================================
# Mock Data Fixtures
# ============================================================================

@pytest.fixture
def mock_week_2_schedule():
    """
    Mock schedule data for Week 2 with simple scenarios.

    Week 1 results:
    - KC beats BAL (KC: 1-0, BAL: 0-1)
    - BUF beats NYJ (BUF: 1-0, NYJ: 0-1)

    Week 2 results:
    - KC beats BUF (KC: 2-0, BUF: 1-1)
    - BAL beats NYJ (BAL: 1-1, NYJ: 0-2)
    """
    data = {
        'week': [1, 1, 2, 2],
        'home_team': ['KC', 'BUF', 'KC', 'BAL'],
        'away_team': ['BAL', 'NYJ', 'BUF', 'NYJ'],
        'home_score': [27, 24, 28, 21],
        'away_score': [20, 17, 21, 14],
        'result': [7, 7, 7, 7],  # Positive = home win
    }
    return pd.DataFrame(data)


@pytest.fixture
def mock_week_4_schedule():
    """
    Mock schedule data for Week 4 with more complex scenarios.

    Includes edge cases:
    - Teams with no wins
    - Teams with no losses
    - Multiple games per team
    """
    data = {
        'week': [1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4],
        'home_team': ['PHI', 'KC', 'DAL', 'SF', 'PHI', 'KC', 'DAL', 'SF', 'PHI', 'KC', 'DAL', 'SF', 'PHI', 'KC', 'DAL', 'SF'],
        'away_team': ['NE', 'LAC', 'NYG', 'ARI', 'BUF', 'CHI', 'NYJ', 'LAR', 'WAS', 'MIN', 'MIA', 'SEA', 'TB', 'DEN', 'CLE', 'LV'],
        'home_score': [25, 44, 40, 30, 34, 41, 30, 30, 25, 28, 20, 42, 25, 19, 20, 35],
        'away_score': [20, 21, 0, 10, 28, 10, 10, 30, 11, 20, 17, 27, 11, 8, 17, 14],
        'result': [5, 23, 40, 20, 6, 31, 20, 0, 14, 8, 3, 15, 14, 11, 3, 21],
    }
    return pd.DataFrame(data)


@pytest.fixture
def mock_schedule_with_ties():
    """
    Mock schedule data including tie games.

    Week 1:
    - KC ties BAL (both 0-0-1)
    - BUF beats NYJ (BUF: 1-0-0, NYJ: 0-1-0)

    Week 2:
    - KC beats BUF (KC: 1-0-1, BUF: 1-1-0)
    - BAL beats NYJ (BAL: 1-0-1, NYJ: 0-2-0)
    """
    data = {
        'week': [1, 1, 2, 2],
        'home_team': ['KC', 'BUF', 'KC', 'BAL'],
        'away_team': ['BAL', 'NYJ', 'BUF', 'NYJ'],
        'home_score': [24, 24, 28, 21],
        'away_score': [24, 17, 21, 14],
        'result': [0, 7, 7, 7],  # 0 = tie
    }
    return pd.DataFrame(data)


@pytest.fixture
def mock_schedule_incomplete():
    """
    Mock schedule with some incomplete games (no scores yet).
    """
    data = {
        'week': [1, 1, 2, 2],
        'home_team': ['KC', 'BUF', 'KC', 'BAL'],
        'away_team': ['BAL', 'NYJ', 'BUF', 'NYJ'],
        'home_score': [27, 24, None, None],
        'away_score': [20, 17, None, None],
        'result': [7, 7, None, None],
    }
    return pd.DataFrame(data)


@pytest.fixture
def mock_schedule_no_wins():
    """
    Mock schedule where a team (NYJ) has no wins.

    Week 1:
    - KC beats NYJ (KC: 1-0, NYJ: 0-1)

    Week 2:
    - BAL beats NYJ (BAL: 1-0, NYJ: 0-2)
    """
    data = {
        'week': [1, 2],
        'home_team': ['KC', 'BAL'],
        'away_team': ['NYJ', 'NYJ'],
        'home_score': [27, 21],
        'away_score': [20, 14],
        'result': [7, 7],
    }
    return pd.DataFrame(data)


@pytest.fixture
def mock_schedule_no_losses():
    """
    Mock schedule where a team (KC) has no losses.

    Week 1:
    - KC beats NYJ (KC: 1-0, NYJ: 0-1)

    Week 2:
    - KC beats BAL (KC: 2-0, BAL: 0-1)
    """
    data = {
        'week': [1, 2],
        'home_team': ['KC', 'KC'],
        'away_team': ['NYJ', 'BAL'],
        'home_score': [27, 28],
        'away_score': [20, 21],
        'result': [7, 7],
    }
    return pd.DataFrame(data)


# ============================================================================
# Tests for Data Processing Functions
# ============================================================================

def test_get_game_results_filters_completed_games(mock_schedule_incomplete):
    """Test that only completed games are returned."""
    completed = get_game_results(mock_schedule_incomplete)

    assert len(completed) == 2
    assert completed['home_score'].notna().all()
    assert completed['away_score'].notna().all()


def test_get_game_results_empty_schedule():
    """Test handling of empty schedule."""
    empty_schedule = pd.DataFrame(columns=['week', 'home_team', 'away_team', 'home_score', 'away_score', 'result'])
    completed = get_game_results(empty_schedule)

    assert len(completed) == 0
    assert completed.empty


def test_get_current_week_basic(mock_week_2_schedule):
    """Test current week detection with simple data."""
    current_week = get_current_week(mock_week_2_schedule)
    assert current_week == 2


def test_get_current_week_week_4(mock_week_4_schedule):
    """Test current week detection with Week 4 data."""
    current_week = get_current_week(mock_week_4_schedule)
    assert current_week == 4


def test_get_current_week_no_completed_games():
    """Test current week detection when no games completed."""
    incomplete = pd.DataFrame({
        'week': [1, 2],
        'home_team': ['KC', 'BUF'],
        'away_team': ['BAL', 'NYJ'],
        'home_score': [None, None],
        'away_score': [None, None],
        'result': [None, None],
    })

    current_week = get_current_week(incomplete)
    assert current_week == 0


def test_validate_data_valid_schedule(mock_week_2_schedule):
    """Test validation passes with valid data."""
    assert validate_data(mock_week_2_schedule) is True


def test_validate_data_missing_fields():
    """Test validation fails with missing required fields."""
    invalid = pd.DataFrame({
        'week': [1, 2],
        'home_team': ['KC', 'BUF'],
        # Missing required fields
    })

    assert validate_data(invalid) is False


# ============================================================================
# Tests for Team Record Calculation
# ============================================================================

def test_get_team_record_week_2(mock_week_2_schedule):
    """Test team record calculation for Week 2."""
    # KC should be 2-0 after Week 2
    kc_record = get_team_record(mock_week_2_schedule, 'KC')
    assert kc_record == {'wins': 2, 'losses': 0, 'ties': 0}

    # BUF should be 1-1 after Week 2
    buf_record = get_team_record(mock_week_2_schedule, 'BUF')
    assert buf_record == {'wins': 1, 'losses': 1, 'ties': 0}

    # NYJ should be 0-2 after Week 2
    nyj_record = get_team_record(mock_week_2_schedule, 'NYJ')
    assert nyj_record == {'wins': 0, 'losses': 2, 'ties': 0}


def test_get_team_record_through_week_1(mock_week_2_schedule):
    """Test team record calculation through specific week."""
    # KC should be 1-0 through Week 1
    kc_record = get_team_record(mock_week_2_schedule, 'KC', through_week=1)
    assert kc_record == {'wins': 1, 'losses': 0, 'ties': 0}

    # BUF should be 1-0 through Week 1
    buf_record = get_team_record(mock_week_2_schedule, 'BUF', through_week=1)
    assert buf_record == {'wins': 1, 'losses': 0, 'ties': 0}


def test_get_team_record_with_ties(mock_schedule_with_ties):
    """Test team record calculation including ties."""
    # KC should be 1-0-1 after Week 2
    kc_record = get_team_record(mock_schedule_with_ties, 'KC')
    assert kc_record == {'wins': 1, 'losses': 0, 'ties': 1}

    # BAL should be 1-0-1 after Week 2
    bal_record = get_team_record(mock_schedule_with_ties, 'BAL')
    assert bal_record == {'wins': 1, 'losses': 0, 'ties': 1}


def test_get_team_record_no_wins(mock_schedule_no_wins):
    """Test team record for team with no wins."""
    nyj_record = get_team_record(mock_schedule_no_wins, 'NYJ')
    assert nyj_record == {'wins': 0, 'losses': 2, 'ties': 0}


def test_get_team_record_no_losses(mock_schedule_no_losses):
    """Test team record for team with no losses."""
    kc_record = get_team_record(mock_schedule_no_losses, 'KC')
    assert kc_record == {'wins': 2, 'losses': 0, 'ties': 0}


# ============================================================================
# Tests for Win Percentage Calculation
# ============================================================================

def test_calculate_win_percentage_basic():
    """Test win percentage calculation with basic values."""
    assert calculate_win_percentage(2, 0, 0) == 1.0
    assert calculate_win_percentage(1, 1, 0) == 0.5
    assert calculate_win_percentage(0, 2, 0) == 0.0


def test_calculate_win_percentage_with_ties():
    """Test win percentage calculation including ties (ties count as 0.5 wins)."""
    # 1-0-1 should be 0.75 (1.5 wins / 2 games)
    assert calculate_win_percentage(1, 0, 1) == 0.75

    # 0-1-1 should be 0.25 (0.5 wins / 2 games)
    assert calculate_win_percentage(0, 1, 1) == 0.25


def test_calculate_win_percentage_no_games():
    """Test win percentage with no games played."""
    assert calculate_win_percentage(0, 0, 0) == 0.0


# ============================================================================
# Tests for Weighted Wins Calculation
# ============================================================================

def test_calculate_weighted_wins_week_2(mock_week_2_schedule):
    """
    Test weighted wins calculation for Week 2.

    KC (2-0):
    - Beat BAL (W1): BAL now 1-1, contributes 1 win
    - Beat BUF (W2): BUF now 1-1, contributes 1 win
    - Total WW: 1 + 1 = 2
    """
    kc_ww = calculate_weighted_wins(mock_week_2_schedule, 'KC')
    assert kc_ww == 2.0


def test_calculate_weighted_wins_buffalo(mock_week_2_schedule):
    """
    Test weighted wins for BUF after Week 2.

    BUF (1-1):
    - Beat NYJ (W1): NYJ now 0-2, contributes 0 wins
    - Total WW: 0
    """
    buf_ww = calculate_weighted_wins(mock_week_2_schedule, 'BUF')
    assert buf_ww == 0.0


def test_calculate_weighted_wins_no_wins(mock_schedule_no_wins):
    """Test weighted wins for team with no wins."""
    nyj_ww = calculate_weighted_wins(mock_schedule_no_wins, 'NYJ')
    assert nyj_ww == 0.0


def test_calculate_weighted_wins_complex(mock_week_4_schedule):
    """Test weighted wins with complex multi-week scenario."""
    # PHI should have accumulated weighted wins from 4 victories
    phi_ww = calculate_weighted_wins(mock_week_4_schedule, 'PHI')
    assert phi_ww > 0.0  # Should have some weighted wins

    # KC should also have accumulated weighted wins
    kc_ww = calculate_weighted_wins(mock_week_4_schedule, 'KC')
    assert kc_ww > 0.0


# ============================================================================
# Tests for Weighted Losses Calculation
# ============================================================================

def test_calculate_weighted_losses_week_2(mock_week_2_schedule):
    """
    Test weighted losses calculation for Week 2.

    NYJ (0-2):
    - Lost to BUF (W1): BUF now 1-1, contributes -1 loss
    - Lost to BAL (W2): BAL now 1-1, contributes -1 loss
    - Total WL: -1 + -1 = -2
    """
    nyj_wl = calculate_weighted_losses(mock_week_2_schedule, 'NYJ')
    assert nyj_wl == -2.0


def test_calculate_weighted_losses_buffalo(mock_week_2_schedule):
    """
    Test weighted losses for BUF after Week 2.

    BUF (1-1):
    - Lost to KC (W2): KC now 2-0, contributes 0 losses
    - Total WL: 0
    """
    buf_wl = calculate_weighted_losses(mock_week_2_schedule, 'BUF')
    assert buf_wl == 0.0


def test_calculate_weighted_losses_no_losses(mock_schedule_no_losses):
    """Test weighted losses for team with no losses."""
    kc_wl = calculate_weighted_losses(mock_schedule_no_losses, 'KC')
    assert kc_wl == 0.0


def test_calculate_weighted_losses_complex(mock_week_4_schedule):
    """Test weighted losses with complex multi-week scenario."""
    # Teams with losses should have negative weighted losses
    # The actual values depend on opponents' loss records
    ne_wl = calculate_weighted_losses(mock_week_4_schedule, 'NE')
    assert ne_wl <= 0.0  # Should be 0 or negative


# ============================================================================
# Tests for Total Score Calculation
# ============================================================================

def test_calculate_total_score_basic():
    """Test total score calculation."""
    assert calculate_total_score(10.0, -5.0) == 5.0
    assert calculate_total_score(0.0, 0.0) == 0.0
    assert calculate_total_score(2.0, -3.0) == -1.0


def test_calculate_total_score_all_wins():
    """Test total score for undefeated team."""
    assert calculate_total_score(15.0, 0.0) == 15.0


def test_calculate_total_score_all_losses():
    """Test total score for winless team."""
    assert calculate_total_score(0.0, -10.0) == -10.0


# ============================================================================
# Tests for Full Rankings Calculation
# ============================================================================

def test_calculate_all_rankings_week_2(mock_week_2_schedule):
    """Test full rankings calculation for Week 2."""
    rankings = calculate_all_rankings(mock_week_2_schedule)

    # Should have 4 teams
    assert len(rankings) == 4

    # Verify all teams are present
    teams = {r['team'] for r in rankings}
    assert teams == {'KC', 'BUF', 'BAL', 'NYJ'}

    # Verify first place is KC (2-0, best total score)
    assert rankings[0]['team'] == 'KC'
    assert rankings[0]['wins'] == 2
    assert rankings[0]['losses'] == 0

    # Verify rankings are sorted by total score descending
    for i in range(len(rankings) - 1):
        assert rankings[i]['total'] >= rankings[i + 1]['total']


def test_calculate_all_rankings_structure(mock_week_2_schedule):
    """Test that rankings have correct structure and fields."""
    rankings = calculate_all_rankings(mock_week_2_schedule)

    for team_data in rankings:
        # Verify all required fields exist
        assert 'team' in team_data
        assert 'wins' in team_data
        assert 'losses' in team_data
        assert 'ties' in team_data
        assert 'win_pct' in team_data
        assert 'weighted_wins' in team_data
        assert 'weighted_losses' in team_data
        assert 'total' in team_data

        # Verify field types
        assert isinstance(team_data['team'], str)
        assert isinstance(team_data['wins'], int)
        assert isinstance(team_data['losses'], int)
        assert isinstance(team_data['ties'], int)
        assert isinstance(team_data['win_pct'], float)
        assert isinstance(team_data['weighted_wins'], float)
        assert isinstance(team_data['weighted_losses'], float)
        assert isinstance(team_data['total'], float)


# ============================================================================
# Tests for JSON Formatting
# ============================================================================

def test_format_team_ranking():
    """Test individual team ranking formatting."""
    input_data = {
        'team': 'KC',
        'wins': 2,
        'losses': 0,
        'ties': 0,
        'win_pct': 1.0,
        'weighted_wins': 2.5,
        'weighted_losses': 0.0,
        'total': 2.5
    }

    formatted = format_team_ranking(input_data)

    assert formatted == input_data
    assert 'team' in formatted
    assert formatted['team'] == 'KC'


def test_format_week_data_structure(mock_week_2_schedule):
    """Test complete week data formatting."""
    rankings = calculate_all_rankings(mock_week_2_schedule)
    week_data = format_week_data(2, rankings)

    # Verify structure
    assert 'timestamp' in week_data
    assert 'week' in week_data
    assert 'season' in week_data
    assert 'rankings' in week_data

    # Verify values
    assert week_data['week'] == 2
    assert week_data['season'] == 2025
    assert isinstance(week_data['rankings'], list)
    assert len(week_data['rankings']) == 4

    # Verify timestamp is ISO format
    timestamp = week_data['timestamp']
    assert isinstance(timestamp, str)
    # Should be parseable as datetime
    parsed_time = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
    assert parsed_time is not None


def test_format_week_data_rankings_order(mock_week_2_schedule):
    """Test that formatted week data preserves ranking order."""
    rankings = calculate_all_rankings(mock_week_2_schedule)
    week_data = format_week_data(2, rankings)

    formatted_rankings = week_data['rankings']

    # First team should be KC
    assert formatted_rankings[0]['team'] == 'KC'

    # Verify order is preserved (descending by total)
    for i in range(len(formatted_rankings) - 1):
        assert formatted_rankings[i]['total'] >= formatted_rankings[i + 1]['total']


# ============================================================================
# Integration Tests
# ============================================================================

def test_full_pipeline_week_2(mock_week_2_schedule):
    """
    Integration test: Full pipeline from schedule to formatted output.
    """
    # Validate data
    assert validate_data(mock_week_2_schedule) is True

    # Get current week
    current_week = get_current_week(mock_week_2_schedule)
    assert current_week == 2

    # Calculate rankings
    rankings = calculate_all_rankings(mock_week_2_schedule)
    assert len(rankings) == 4

    # Format week data
    week_data = format_week_data(current_week, rankings)

    # Verify complete structure
    assert week_data['week'] == 2
    assert len(week_data['rankings']) == 4

    # Verify top team is KC with correct stats
    top_team = week_data['rankings'][0]
    assert top_team['team'] == 'KC'
    assert top_team['wins'] == 2
    assert top_team['losses'] == 0
    assert top_team['weighted_wins'] == 2.0
    assert top_team['total'] > 0


def test_full_pipeline_week_4(mock_week_4_schedule):
    """
    Integration test: Full pipeline with Week 4 complex data.
    """
    # Validate data
    assert validate_data(mock_week_4_schedule) is True

    # Get current week
    current_week = get_current_week(mock_week_4_schedule)
    assert current_week == 4

    # Calculate rankings
    rankings = calculate_all_rankings(mock_week_4_schedule)
    assert len(rankings) > 0

    # All teams should have valid records
    for team_data in rankings:
        assert team_data['wins'] >= 0
        assert team_data['losses'] >= 0
        assert team_data['ties'] >= 0

        # Win percentage should be between 0 and 1
        assert 0.0 <= team_data['win_pct'] <= 1.0

        # Total should equal WW + WL
        expected_total = team_data['weighted_wins'] + team_data['weighted_losses']
        assert abs(team_data['total'] - expected_total) < 0.01


def test_json_serializable(mock_week_2_schedule):
    """Test that output can be serialized to JSON."""
    rankings = calculate_all_rankings(mock_week_2_schedule)
    week_data = format_week_data(2, rankings)

    # Should be JSON serializable without errors
    json_string = json.dumps(week_data, indent=2)
    assert isinstance(json_string, str)

    # Should be able to parse back
    parsed = json.loads(json_string)
    assert parsed['week'] == 2
    assert len(parsed['rankings']) == 4


# ============================================================================
# Edge Case Tests
# ============================================================================

def test_edge_case_team_with_no_wins(mock_schedule_no_wins):
    """Test rankings calculation when a team has no wins."""
    rankings = calculate_all_rankings(mock_schedule_no_wins)

    # Find NYJ in rankings
    nyj_data = next((r for r in rankings if r['team'] == 'NYJ'), None)
    assert nyj_data is not None

    # NYJ should have 0 wins and 0 weighted wins
    assert nyj_data['wins'] == 0
    assert nyj_data['weighted_wins'] == 0.0

    # Should have negative weighted losses and total
    assert nyj_data['weighted_losses'] < 0.0
    assert nyj_data['total'] < 0.0


def test_edge_case_team_with_no_losses(mock_schedule_no_losses):
    """Test rankings calculation when a team has no losses."""
    rankings = calculate_all_rankings(mock_schedule_no_losses)

    # Find KC in rankings
    kc_data = next((r for r in rankings if r['team'] == 'KC'), None)
    assert kc_data is not None

    # KC should have 0 losses and 0 weighted losses
    assert kc_data['losses'] == 0
    assert kc_data['weighted_losses'] == 0.0

    # Should have positive weighted wins and total
    assert kc_data['weighted_wins'] >= 0.0
    assert kc_data['total'] >= 0.0


def test_edge_case_ties(mock_schedule_with_ties):
    """Test rankings calculation including tie games."""
    rankings = calculate_all_rankings(mock_schedule_with_ties)

    # Find KC in rankings
    kc_data = next((r for r in rankings if r['team'] == 'KC'), None)
    assert kc_data is not None

    # KC should have 1 tie
    assert kc_data['ties'] == 1

    # Win percentage should account for tie (1.5 / 2 = 0.75)
    assert kc_data['win_pct'] == 0.75

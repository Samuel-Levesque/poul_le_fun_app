from models.game import Game
from models.team import Team
from itertools import combinations
import statistics

class GameGenerator:
    def __init__(self, db):
        self.db = db
        self.played_matchups = self._load_played_matchups()
        self.team_game_count = self._load_team_game_counts()

    def _load_played_matchups(self):
        """Load all matchups that have been completed"""
        completed_games = Game.query.filter_by(status='completed').all()
        matchups = set()

        for game in completed_games:
            # Store as frozenset to make it order-independent
            matchup = frozenset([game.team1_id, game.team2_id])
            matchups.add(matchup)

        return matchups

    def _load_team_game_counts(self):
        """Load the number of games each team has played"""
        from collections import defaultdict

        team_counts = defaultdict(int)
        completed_games = Game.query.filter_by(status='completed').all()

        for game in completed_games:
            team_counts[game.team1_id] += 1
            team_counts[game.team2_id] += 1

        return team_counts

    def _get_currently_playing_teams(self):
        """Get set of team IDs that are currently playing"""
        in_progress_games = Game.query.filter_by(status='in_progress').all()
        busy_teams = set()

        for game in in_progress_games:
            busy_teams.add(game.team1_id)
            busy_teams.add(game.team2_id)

        return busy_teams

    def _score_matchup(self, team1_id, team2_id):
        """
        Score a potential matchup based on fairness criteria.
        Higher score = more fair
        """
        # Get game counts for both teams
        count1 = self.team_game_count.get(team1_id, 0)
        count2 = self.team_game_count.get(team2_id, 0)

        # Prefer matchups where both teams have played fewer games
        # Use negative sum so teams with fewer games get higher scores
        total_games = count1 + count2
        fairness_score = -total_games

        # Add penalty for variance (prefer balanced matchups)
        variance = abs(count1 - count2)
        balance_penalty = -variance

        return fairness_score + balance_penalty

    def generate_next_game(self):
        """
        Generate the next fair game.
        Returns a Game object (not yet committed to DB) or None if no game can be generated.
        """
        # Get all teams
        all_teams = Team.query.all()
        team_ids = [team.id for team in all_teams]

        if len(team_ids) < 2:
            return None

        # Get teams that are currently playing
        busy_teams = self._get_currently_playing_teams()

        # Get available teams
        available_team_ids = [tid for tid in team_ids if tid not in busy_teams]

        if len(available_team_ids) < 2:
            return None  # Not enough available teams

        # Generate all possible matchups from available teams
        possible_matchups = list(combinations(available_team_ids, 2))

        # Filter out already-played matchups
        unplayed_matchups = []
        for team1_id, team2_id in possible_matchups:
            matchup = frozenset([team1_id, team2_id])
            if matchup not in self.played_matchups:
                unplayed_matchups.append((team1_id, team2_id))

        if not unplayed_matchups:
            return None  # All available matchups have been played

        # Score each matchup and select the best one
        scored_matchups = []
        for team1_id, team2_id in unplayed_matchups:
            score = self._score_matchup(team1_id, team2_id)
            scored_matchups.append((score, team1_id, team2_id))

        # Sort by score (highest first)
        scored_matchups.sort(reverse=True)

        # Select best matchup
        _, team1_id, team2_id = scored_matchups[0]

        # Ensure team1_id < team2_id for database constraint
        if team1_id > team2_id:
            team1_id, team2_id = team2_id, team1_id

        # Create game and start it immediately
        from datetime import datetime
        game = Game(
            team1_id=team1_id,
            team2_id=team2_id,
            status='in_progress',
            started_at=datetime.utcnow()
        )
        self.db.session.add(game)
        self.db.session.commit()

        return game

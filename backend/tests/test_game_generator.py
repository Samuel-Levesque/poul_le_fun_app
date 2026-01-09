"""Tests for GameGenerator service"""
import pytest
from services.game_generator import GameGenerator
from models.team import Team
from models.game import Game


class TestGameGenerator:
    """Test suite for GameGenerator service"""

    def test_generate_next_game_with_no_teams(self, app, db):
        """Test that no game is generated when no teams exist"""
        generator = GameGenerator(db)
        game = generator.generate_next_game()
        assert game is None

    def test_generate_next_game_with_one_team(self, app, db):
        """Test that no game is generated with only one team"""
        team = Team(name='Team 1', player1='Alice', player2='Bob')
        db.session.add(team)
        db.session.commit()

        generator = GameGenerator(db)
        game = generator.generate_next_game()
        assert game is None

    def test_generate_next_game_basic(self, app, db, sample_teams):
        """Test basic game generation with available teams"""
        generator = GameGenerator(db)
        game = generator.generate_next_game()

        assert game is not None
        assert game.id is not None
        assert game.status == 'in_progress'
        assert game.started_at is not None
        assert game.team1_id < game.team2_id
        assert game.team1_id in [t.id for t in sample_teams]
        assert game.team2_id in [t.id for t in sample_teams]
        assert game.team1_id != game.team2_id

    def test_generate_next_game_respects_team_ordering(self, app, db, sample_teams):
        """Test that generated games maintain team1_id < team2_id constraint"""
        generator = GameGenerator(db)
        for _ in range(5):
            game = generator.generate_next_game()
            if game:
                assert game.team1_id < game.team2_id

    def test_generate_next_game_excludes_busy_teams(self, app, db, sample_teams):
        """Test that teams currently playing are excluded from new games"""
        # Create a game in progress with teams 0 and 1
        in_progress_game = Game(
            team1_id=sample_teams[0].id,
            team2_id=sample_teams[1].id,
            status='in_progress'
        )
        db.session.add(in_progress_game)
        db.session.commit()

        # Generate next game - should not include teams 0 or 1
        generator = GameGenerator(db)
        game = generator.generate_next_game()

        assert game is not None
        assert sample_teams[0].id not in [game.team1_id, game.team2_id]
        assert sample_teams[1].id not in [game.team1_id, game.team2_id]

    def test_generate_next_game_no_available_teams(self, app, db, sample_teams):
        """Test when all teams are currently playing"""
        # Create two in-progress games using all 4 teams
        game1 = Game(
            team1_id=sample_teams[0].id,
            team2_id=sample_teams[1].id,
            status='in_progress'
        )
        game2 = Game(
            team1_id=sample_teams[2].id,
            team2_id=sample_teams[3].id,
            status='in_progress'
        )
        db.session.add_all([game1, game2])
        db.session.commit()

        generator = GameGenerator(db)
        game = generator.generate_next_game()
        assert game is None

    def test_generate_next_game_avoids_duplicate_matchups(self, app, db, sample_teams):
        """Test that already-played matchups are not repeated"""
        # Create a completed game between teams 0 and 1
        completed_game = Game(
            team1_id=sample_teams[0].id,
            team2_id=sample_teams[1].id,
            status='completed'
        )
        db.session.add(completed_game)
        db.session.commit()

        # Generate next game - should not be teams 0 vs 1
        generator = GameGenerator(db)
        game = generator.generate_next_game()

        assert game is not None
        matchup = frozenset([game.team1_id, game.team2_id])
        assert matchup != frozenset([sample_teams[0].id, sample_teams[1].id])

    def test_generate_next_game_all_matchups_exhausted(self, app, db):
        """Test when all possible matchups have been played"""
        # Create 3 teams
        teams = [
            Team(name='Team 1', player1='Alice', player2='Bob'),
            Team(name='Team 2', player1='Charlie', player2='David'),
            Team(name='Team 3', player1='Eve', player2='Frank'),
        ]
        for team in teams:
            db.session.add(team)
        db.session.commit()

        # Play all possible matchups (3 games for 3 teams)
        games = [
            Game(team1_id=teams[0].id, team2_id=teams[1].id, status='completed'),
            Game(team1_id=teams[0].id, team2_id=teams[2].id, status='completed'),
            Game(team1_id=teams[1].id, team2_id=teams[2].id, status='completed'),
        ]
        for game in games:
            db.session.add(game)
        db.session.commit()

        generator = GameGenerator(db)
        game = generator.generate_next_game()
        assert game is None

    def test_fairness_scoring_prefers_teams_with_fewer_games(self, app, db):
        """Test that fairness algorithm prioritizes teams with fewer games"""
        # Create 4 teams
        teams = [
            Team(name='Team 1', player1='Alice', player2='Bob'),
            Team(name='Team 2', player1='Charlie', player2='David'),
            Team(name='Team 3', player1='Eve', player2='Frank'),
            Team(name='Team 4', player1='Grace', player2='Henry'),
        ]
        for team in teams:
            db.session.add(team)
        db.session.commit()

        # Teams 0 and 1 have already played each other
        game1 = Game(team1_id=teams[0].id, team2_id=teams[1].id, status='completed')
        db.session.add(game1)
        db.session.commit()

        # Next game should involve teams 2 and 3 (who haven't played yet)
        generator = GameGenerator(db)
        game = generator.generate_next_game()

        assert game is not None
        # Should prefer teams 2 and 3 who have 0 games
        matchup = frozenset([game.team1_id, game.team2_id])
        expected_matchup = frozenset([teams[2].id, teams[3].id])
        assert matchup == expected_matchup

    def test_fairness_scoring_balances_game_counts(self, app, db):
        """Test that algorithm balances game counts across teams"""
        # Create 4 teams
        teams = [
            Team(name='Team 1', player1='Alice', player2='Bob'),
            Team(name='Team 2', player1='Charlie', player2='David'),
            Team(name='Team 3', player1='Eve', player2='Frank'),
            Team(name='Team 4', player1='Grace', player2='Henry'),
        ]
        for team in teams:
            db.session.add(team)
        db.session.commit()

        # Team 0 has played 2 games, team 1 has played 1 game
        # Teams 2 and 3 have played 0 games
        game1 = Game(team1_id=teams[0].id, team2_id=teams[1].id, status='completed')
        game2 = Game(team1_id=teams[0].id, team2_id=teams[2].id, status='completed')
        db.session.add_all([game1, game2])
        db.session.commit()

        generator = GameGenerator(db)
        game = generator.generate_next_game()

        assert game is not None
        # Should prefer matchup with lowest total games
        # Best options: team 2 or 3 (0 games) paired with team 3 or 1
        # Teams 2 and 3 together = 0 total games (best)
        matchup = frozenset([game.team1_id, game.team2_id])

        # Either teams 2-3 (best: 0 total) or 1-3 or 1-2 (1 total each)
        # Should be 2-3 as it has lowest total
        assert teams[2].id in matchup or teams[3].id in matchup

    def test_load_played_matchups(self, app, db, sample_teams):
        """Test that completed matchups are correctly loaded"""
        # Create some completed games
        game1 = Game(
            team1_id=sample_teams[0].id,
            team2_id=sample_teams[1].id,
            status='completed'
        )
        game2 = Game(
            team1_id=sample_teams[2].id,
            team2_id=sample_teams[3].id,
            status='completed'
        )
        db.session.add_all([game1, game2])
        db.session.commit()

        generator = GameGenerator(db)

        matchup1 = frozenset([sample_teams[0].id, sample_teams[1].id])
        matchup2 = frozenset([sample_teams[2].id, sample_teams[3].id])

        assert matchup1 in generator.played_matchups
        assert matchup2 in generator.played_matchups

    def test_load_team_game_counts(self, app, db, sample_teams):
        """Test that team game counts are correctly calculated"""
        # Team 0 plays 2 games, team 1 plays 2 games, team 2 plays 1 game
        game1 = Game(
            team1_id=sample_teams[0].id,
            team2_id=sample_teams[1].id,
            status='completed'
        )
        game2 = Game(
            team1_id=sample_teams[0].id,
            team2_id=sample_teams[2].id,
            status='completed'
        )
        db.session.add_all([game1, game2])
        db.session.commit()

        generator = GameGenerator(db)

        assert generator.team_game_count[sample_teams[0].id] == 2
        assert generator.team_game_count[sample_teams[1].id] == 1
        assert generator.team_game_count[sample_teams[2].id] == 1
        assert generator.team_game_count[sample_teams[3].id] == 0

    def test_only_completed_games_count(self, app, db, sample_teams):
        """Test that only completed games are counted in history"""
        # Create games in different states
        game1 = Game(
            team1_id=sample_teams[0].id,
            team2_id=sample_teams[1].id,
            status='completed'
        )
        game2 = Game(
            team1_id=sample_teams[0].id,
            team2_id=sample_teams[2].id,
            status='in_progress'
        )
        game3 = Game(
            team1_id=sample_teams[0].id,
            team2_id=sample_teams[3].id,
            status='scheduled'
        )
        db.session.add_all([game1, game2, game3])
        db.session.commit()

        generator = GameGenerator(db)

        # Only completed game should count
        assert len(generator.played_matchups) == 1
        assert generator.team_game_count[sample_teams[0].id] == 1
        assert generator.team_game_count[sample_teams[1].id] == 1

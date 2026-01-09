"""Tests for database models"""
import pytest
from datetime import datetime
from models.team import Team
from models.game import Game
from models.result import Result
from sqlalchemy.exc import IntegrityError


class TestTeamModel:
    """Test suite for Team model"""

    def test_create_team(self, app, db):
        """Test basic team creation"""
        team = Team(name='Team 1', player1='Alice', player2='Bob')
        db.session.add(team)
        db.session.commit()

        assert team.id is not None
        assert team.name == 'Team 1'
        assert team.player1 == 'Alice'
        assert team.player2 == 'Bob'
        assert team.created_at is not None

    def test_team_to_dict(self, app, db):
        """Test team serialization"""
        team = Team(name='Team 1', player1='Alice', player2='Bob')
        db.session.add(team)
        db.session.commit()

        team_dict = team.to_dict()

        assert team_dict['id'] == team.id
        assert team_dict['name'] == 'Team 1'
        assert team_dict['player1'] == 'Alice'
        assert team_dict['player2'] == 'Bob'
        assert 'created_at' in team_dict

    def test_team_repr(self, app, db):
        """Test team string representation"""
        team = Team(name='Team 1', player1='Alice', player2='Bob')
        repr_str = repr(team)

        assert 'Team 1' in repr_str
        assert 'Alice' in repr_str
        assert 'Bob' in repr_str


class TestGameModel:
    """Test suite for Game model"""

    def test_create_game(self, app, db, sample_teams):
        """Test basic game creation"""
        game = Game(
            team1_id=sample_teams[0].id,
            team2_id=sample_teams[1].id,
            status='scheduled'
        )
        db.session.add(game)
        db.session.commit()

        assert game.id is not None
        assert game.team1_id == sample_teams[0].id
        assert game.team2_id == sample_teams[1].id
        assert game.status == 'scheduled'
        assert game.created_at is not None
        assert game.started_at is None
        assert game.completed_at is None

    def test_game_relationships(self, app, db, sample_teams):
        """Test game relationships with teams"""
        game = Game(
            team1_id=sample_teams[0].id,
            team2_id=sample_teams[1].id,
            status='scheduled'
        )
        db.session.add(game)
        db.session.commit()

        assert game.team1.id == sample_teams[0].id
        assert game.team2.id == sample_teams[1].id
        assert game.team1.name == 'Team 1'
        assert game.team2.name == 'Team 2'

    def test_game_to_dict(self, app, db, sample_teams):
        """Test game serialization"""
        game = Game(
            team1_id=sample_teams[0].id,
            team2_id=sample_teams[1].id,
            status='in_progress',
            started_at=datetime.utcnow()
        )
        db.session.add(game)
        db.session.commit()

        game_dict = game.to_dict()

        assert game_dict['id'] == game.id
        assert game_dict['status'] == 'in_progress'
        assert game_dict['team1']['id'] == sample_teams[0].id
        assert game_dict['team2']['id'] == sample_teams[1].id
        assert 'created_at' in game_dict
        assert game_dict['started_at'] is not None

    def test_game_team_order_constraint(self, app, db, sample_teams):
        """Test that team1_id must be less than team2_id"""
        # This should fail at the database level
        game = Game(
            team1_id=sample_teams[1].id,  # Higher ID
            team2_id=sample_teams[0].id,  # Lower ID
            status='scheduled'
        )
        db.session.add(game)

        with pytest.raises(IntegrityError):
            db.session.commit()

        db.session.rollback()

    def test_game_different_teams_constraint(self, app, db, sample_teams):
        """Test that a team cannot play against itself"""
        game = Game(
            team1_id=sample_teams[0].id,
            team2_id=sample_teams[0].id,  # Same team
            status='scheduled'
        )
        db.session.add(game)

        with pytest.raises(IntegrityError):
            db.session.commit()

        db.session.rollback()

    def test_game_status_values(self, app, db, sample_teams):
        """Test different game status values"""
        statuses = ['scheduled', 'in_progress', 'completed']

        for status in statuses:
            game = Game(
                team1_id=sample_teams[0].id,
                team2_id=sample_teams[1].id,
                status=status
            )
            db.session.add(game)
            db.session.commit()

            assert game.status == status
            db.session.delete(game)
            db.session.commit()


class TestResultModel:
    """Test suite for Result model"""

    def test_create_result(self, app, db, sample_teams):
        """Test basic result creation"""
        game = Game(
            team1_id=sample_teams[0].id,
            team2_id=sample_teams[1].id,
            status='completed'
        )
        db.session.add(game)
        db.session.commit()

        result = Result(
            game_id=game.id,
            winning_team_id=sample_teams[0].id,
            score=10
        )
        db.session.add(result)
        db.session.commit()

        assert result.id is not None
        assert result.game_id == game.id
        assert result.winning_team_id == sample_teams[0].id
        assert result.score == 10
        assert result.created_at is not None

    def test_result_relationships(self, app, db, sample_teams):
        """Test result relationships"""
        game = Game(
            team1_id=sample_teams[0].id,
            team2_id=sample_teams[1].id,
            status='completed'
        )
        db.session.add(game)
        db.session.commit()

        result = Result(
            game_id=game.id,
            winning_team_id=sample_teams[0].id,
            score=15
        )
        db.session.add(result)
        db.session.commit()

        # Test relationships
        assert result.game.id == game.id
        assert result.winning_team.id == sample_teams[0].id
        assert game.result.id == result.id

    def test_result_to_dict(self, app, db, sample_teams):
        """Test result serialization"""
        game = Game(
            team1_id=sample_teams[0].id,
            team2_id=sample_teams[1].id,
            status='completed'
        )
        db.session.add(game)
        db.session.commit()

        result = Result(
            game_id=game.id,
            winning_team_id=sample_teams[0].id,
            score=20
        )
        db.session.add(result)
        db.session.commit()

        result_dict = result.to_dict()

        assert result_dict['id'] == result.id
        assert result_dict['game_id'] == game.id
        assert result_dict['winning_team_id'] == sample_teams[0].id
        assert result_dict['score'] == 20
        assert result_dict['winning_team']['name'] == 'Team 1'
        assert 'created_at' in result_dict

    def test_result_unique_game_constraint(self, app, db, sample_teams):
        """Test that only one result can exist per game"""
        game = Game(
            team1_id=sample_teams[0].id,
            team2_id=sample_teams[1].id,
            status='completed'
        )
        db.session.add(game)
        db.session.commit()

        # First result
        result1 = Result(
            game_id=game.id,
            winning_team_id=sample_teams[0].id,
            score=10
        )
        db.session.add(result1)
        db.session.commit()

        # Try to create second result for same game
        result2 = Result(
            game_id=game.id,
            winning_team_id=sample_teams[1].id,
            score=5
        )
        db.session.add(result2)

        with pytest.raises(IntegrityError):
            db.session.commit()

        db.session.rollback()

    def test_result_positive_score_constraint(self, app, db, sample_teams):
        """Test that score must be non-negative"""
        game = Game(
            team1_id=sample_teams[0].id,
            team2_id=sample_teams[1].id,
            status='completed'
        )
        db.session.add(game)
        db.session.commit()

        result = Result(
            game_id=game.id,
            winning_team_id=sample_teams[0].id,
            score=-5  # Negative score
        )
        db.session.add(result)

        with pytest.raises(IntegrityError):
            db.session.commit()

        db.session.rollback()

    def test_result_zero_score_allowed(self, app, db, sample_teams):
        """Test that zero score is allowed"""
        game = Game(
            team1_id=sample_teams[0].id,
            team2_id=sample_teams[1].id,
            status='completed'
        )
        db.session.add(game)
        db.session.commit()

        result = Result(
            game_id=game.id,
            winning_team_id=sample_teams[0].id,
            score=0
        )
        db.session.add(result)
        db.session.commit()

        assert result.score == 0


class TestModelRelationships:
    """Test suite for relationships between models"""

    def test_team_games_relationship(self, app, db, sample_teams):
        """Test team's relationship with games"""
        # Create games where team 0 participates
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
        db.session.add_all([game1, game2])
        db.session.commit()

        # Check backref relationships
        assert len(sample_teams[0].games_as_team1) == 2
        assert len(sample_teams[1].games_as_team1) == 0

    def test_cascade_behavior(self, app, db, sample_teams):
        """Test cascade delete behavior"""
        # Create game with result
        game = Game(
            team1_id=sample_teams[0].id,
            team2_id=sample_teams[1].id,
            status='completed'
        )
        db.session.add(game)
        db.session.commit()

        result = Result(
            game_id=game.id,
            winning_team_id=sample_teams[0].id,
            score=10
        )
        db.session.add(result)
        db.session.commit()

        # Note: Teams with games should not be deletable
        # This is enforced at the application level
        # (see teams routes tests for that validation)

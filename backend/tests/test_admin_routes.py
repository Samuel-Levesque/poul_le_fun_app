"""Tests for Admin API routes"""
import pytest
import json
from models.team import Team
from models.game import Game
from models.result import Result


class TestAdminRoutes:
    """Test suite for Admin API endpoints"""

    def test_clear_database_empty(self, client, db):
        """Test clearing an empty database"""
        response = client.post('/api/admin/clear-database')

        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'message' in data
        assert data['deleted']['teams'] == 0
        assert data['deleted']['games'] == 0
        assert data['deleted']['results'] == 0

    def test_clear_database_with_data(self, client, db, sample_teams):
        """Test clearing database with existing data"""
        # Create games and results
        game1 = Game(
            team1_id=sample_teams[0].id,
            team2_id=sample_teams[1].id,
            status='completed'
        )
        game2 = Game(
            team1_id=sample_teams[2].id,
            team2_id=sample_teams[3].id,
            status='in_progress'
        )
        db.session.add_all([game1, game2])
        db.session.commit()

        result = Result(
            game_id=game1.id,
            winning_team_id=sample_teams[0].id,
            score=10
        )
        db.session.add(result)
        db.session.commit()

        response = client.post('/api/admin/clear-database')

        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['deleted']['teams'] == 4
        assert data['deleted']['games'] == 2
        assert data['deleted']['results'] == 1

        # Verify database is empty
        assert Team.query.count() == 0
        assert Game.query.count() == 0
        assert Result.query.count() == 0

    def test_clear_database_respects_foreign_keys(self, client, db, sample_teams):
        """Test that clear operation respects foreign key constraints"""
        # Create complex data with foreign key relationships
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

        # Clear should delete in proper order (results -> games -> teams)
        response = client.post('/api/admin/clear-database')

        assert response.status_code == 200

        # Verify all tables are empty
        assert Result.query.count() == 0
        assert Game.query.count() == 0
        assert Team.query.count() == 0

    def test_clear_database_multiple_times(self, client, db):
        """Test that clearing database multiple times works"""
        # Create some data
        team = Team(name='Team 1', player1='Alice', player2='Bob')
        db.session.add(team)
        db.session.commit()

        # First clear
        response1 = client.post('/api/admin/clear-database')
        assert response1.status_code == 200

        # Second clear (empty database)
        response2 = client.post('/api/admin/clear-database')
        assert response2.status_code == 200
        data = json.loads(response2.data)
        assert data['deleted']['teams'] == 0

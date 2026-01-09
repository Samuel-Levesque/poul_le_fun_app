"""Tests for Results API routes"""
import pytest
import json
from models.game import Game
from models.result import Result
from datetime import datetime


class TestResultsRoutes:
    """Test suite for Results API endpoints"""

    def test_create_result_success(self, client, db, sample_teams):
        """Test successful result creation"""
        game = Game(
            team1_id=sample_teams[0].id,
            team2_id=sample_teams[1].id,
            status='in_progress',
            started_at=datetime.utcnow()
        )
        db.session.add(game)
        db.session.commit()

        response = client.post('/api/results',
            data=json.dumps({
                'game_id': game.id,
                'winning_team_id': sample_teams[0].id,
                'score': 10
            }),
            content_type='application/json'
        )

        assert response.status_code == 201
        data = json.loads(response.data)
        assert data['game_id'] == game.id
        assert data['winning_team_id'] == sample_teams[0].id
        assert data['score'] == 10

        # Verify game status updated
        game = Game.query.get(game.id)
        assert game.status == 'completed'
        assert game.completed_at is not None

    def test_create_result_missing_fields(self, client, db):
        """Test result creation with missing fields"""
        response = client.post('/api/results',
            data=json.dumps({'game_id': 1}),
            content_type='application/json'
        )

        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data

    def test_create_result_game_not_found(self, client, db, sample_teams):
        """Test result creation for non-existent game"""
        response = client.post('/api/results',
            data=json.dumps({
                'game_id': 999,
                'winning_team_id': sample_teams[0].id,
                'score': 10
            }),
            content_type='application/json'
        )

        assert response.status_code == 404
        data = json.loads(response.data)
        assert 'error' in data

    def test_create_result_game_not_in_progress(self, client, db, sample_teams):
        """Test that results can only be submitted for in-progress games"""
        game = Game(
            team1_id=sample_teams[0].id,
            team2_id=sample_teams[1].id,
            status='scheduled'
        )
        db.session.add(game)
        db.session.commit()

        response = client.post('/api/results',
            data=json.dumps({
                'game_id': game.id,
                'winning_team_id': sample_teams[0].id,
                'score': 10
            }),
            content_type='application/json'
        )

        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data
        assert 'in-progress' in data['error']

    def test_create_result_invalid_winner(self, client, db, sample_teams):
        """Test that winner must be a participant in the game"""
        game = Game(
            team1_id=sample_teams[0].id,
            team2_id=sample_teams[1].id,
            status='in_progress'
        )
        db.session.add(game)
        db.session.commit()

        # Try to set team 2 as winner (not in this game)
        response = client.post('/api/results',
            data=json.dumps({
                'game_id': game.id,
                'winning_team_id': sample_teams[2].id,
                'score': 10
            }),
            content_type='application/json'
        )

        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data

    def test_create_result_negative_score(self, client, db, sample_teams):
        """Test that negative scores are rejected"""
        game = Game(
            team1_id=sample_teams[0].id,
            team2_id=sample_teams[1].id,
            status='in_progress'
        )
        db.session.add(game)
        db.session.commit()

        response = client.post('/api/results',
            data=json.dumps({
                'game_id': game.id,
                'winning_team_id': sample_teams[0].id,
                'score': -5
            }),
            content_type='application/json'
        )

        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data

    def test_create_result_zero_score_allowed(self, client, db, sample_teams):
        """Test that zero score is allowed"""
        game = Game(
            team1_id=sample_teams[0].id,
            team2_id=sample_teams[1].id,
            status='in_progress'
        )
        db.session.add(game)
        db.session.commit()

        response = client.post('/api/results',
            data=json.dumps({
                'game_id': game.id,
                'winning_team_id': sample_teams[0].id,
                'score': 0
            }),
            content_type='application/json'
        )

        assert response.status_code == 201

    def test_create_result_duplicate_prevention(self, client, db, sample_teams):
        """Test that duplicate results cannot be created"""
        # Create game and first result through API to ensure proper state
        game = Game(
            team1_id=sample_teams[0].id,
            team2_id=sample_teams[1].id,
            status='in_progress'
        )
        db.session.add(game)
        db.session.commit()

        # Submit first result through API
        response = client.post('/api/results',
            data=json.dumps({
                'game_id': game.id,
                'winning_team_id': sample_teams[0].id,
                'score': 10
            }),
            content_type='application/json'
        )
        assert response.status_code == 201

        # Manually set game back to in_progress to bypass status check
        # This tests the duplicate result check specifically
        game = Game.query.get(game.id)
        game.status = 'in_progress'
        db.session.commit()

        # Try to create another result for the same game
        response = client.post('/api/results',
            data=json.dumps({
                'game_id': game.id,
                'winning_team_id': sample_teams[1].id,
                'score': 5
            }),
            content_type='application/json'
        )

        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data
        assert 'already exists' in data['error']

    def test_get_results_empty(self, client, db):
        """Test getting results when none exist"""
        response = client.get('/api/results')

        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'results' in data
        assert len(data['results']) == 0

    def test_get_results_all(self, client, db, sample_teams):
        """Test getting all results"""
        # Create multiple games and results
        for i in range(2):
            game = Game(
                team1_id=sample_teams[i * 2].id,
                team2_id=sample_teams[i * 2 + 1].id,
                status='completed'
            )
            db.session.add(game)
            db.session.commit()

            result = Result(
                game_id=game.id,
                winning_team_id=sample_teams[i * 2].id,
                score=10 + i
            )
            db.session.add(result)

        db.session.commit()

        response = client.get('/api/results')

        assert response.status_code == 200
        data = json.loads(response.data)
        assert len(data['results']) == 2

        # Verify structure
        result = data['results'][0]
        assert 'id' in result
        assert 'game_id' in result
        assert 'winning_team_id' in result
        assert 'winning_team' in result
        assert 'score' in result
        assert 'created_at' in result

    def test_get_result_by_id(self, client, db, sample_teams):
        """Test getting a specific result by ID"""
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

        response = client.get(f'/api/results/{result.id}')

        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['id'] == result.id
        assert data['score'] == 15

    def test_get_result_not_found(self, client, db):
        """Test getting a non-existent result"""
        response = client.get('/api/results/999')
        assert response.status_code == 404

    def test_get_rankings(self, client, db, sample_teams):
        """Test getting team rankings"""
        # Create some games and results
        game1 = Game(
            team1_id=sample_teams[0].id,
            team2_id=sample_teams[1].id,
            status='completed'
        )
        db.session.add(game1)
        db.session.commit()

        result1 = Result(
            game_id=game1.id,
            winning_team_id=sample_teams[0].id,
            score=20
        )
        db.session.add(result1)
        db.session.commit()

        response = client.get('/api/rankings')

        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'rankings' in data
        assert len(data['rankings']) == 4

        # Verify ranking structure
        ranking = data['rankings'][0]
        assert 'rank' in ranking
        assert 'team_id' in ranking
        assert 'team_name' in ranking
        assert 'players' in ranking
        assert 'total_score' in ranking
        assert 'games_played' in ranking
        assert 'games_won' in ranking
        assert 'games_lost' in ranking
        assert 'win_rate' in ranking

    def test_get_match_matrix_empty(self, client, db, sample_teams):
        """Test match matrix with no games"""
        response = client.get('/api/match-matrix')

        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'teams' in data
        assert 'matrix' in data
        assert len(data['teams']) == 4

        # All matchups should be unplayed
        matrix = data['matrix']
        for team1 in sample_teams:
            for team2 in sample_teams:
                if team1.id != team2.id:
                    assert matrix[str(team1.id)][str(team2.id)]['status'] == 'unplayed'

    def test_get_match_matrix_with_games(self, client, db, sample_teams):
        """Test match matrix with completed and in-progress games"""
        # Completed game
        game1 = Game(
            team1_id=sample_teams[0].id,
            team2_id=sample_teams[1].id,
            status='completed'
        )
        db.session.add(game1)
        db.session.commit()

        # In-progress game
        game2 = Game(
            team1_id=sample_teams[2].id,
            team2_id=sample_teams[3].id,
            status='in_progress'
        )
        db.session.add(game2)
        db.session.commit()

        response = client.get('/api/match-matrix')

        assert response.status_code == 200
        data = json.loads(response.data)
        matrix = data['matrix']

        # Check completed game status
        matchup1 = matrix[str(sample_teams[0].id)][str(sample_teams[1].id)]
        assert matchup1['status'] == 'completed'
        assert matchup1['game_id'] == game1.id

        # Check in-progress game status
        matchup2 = matrix[str(sample_teams[2].id)][str(sample_teams[3].id)]
        assert matchup2['status'] == 'in_progress'
        assert matchup2['game_id'] == game2.id

        # Check unplayed matchup
        matchup3 = matrix[str(sample_teams[0].id)][str(sample_teams[2].id)]
        assert matchup3['status'] == 'unplayed'

    def test_get_match_matrix_diagonal_null(self, client, db, sample_teams):
        """Test that matrix diagonal (team vs itself) is null"""
        response = client.get('/api/match-matrix')

        assert response.status_code == 200
        data = json.loads(response.data)
        matrix = data['matrix']

        for team in sample_teams:
            assert matrix[str(team.id)][str(team.id)] is None

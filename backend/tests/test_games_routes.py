"""Tests for Games API routes"""
import pytest
import json
from models.game import Game
from models.team import Team
from datetime import datetime


class TestGamesRoutes:
    """Test suite for Games API endpoints"""

    def test_get_games_empty(self, client, db):
        """Test getting games when none exist"""
        response = client.get('/api/games')

        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'games' in data
        assert len(data['games']) == 0

    def test_get_games_all(self, client, db, sample_teams):
        """Test getting all games"""
        game1 = Game(team1_id=sample_teams[0].id, team2_id=sample_teams[1].id, status='scheduled')
        game2 = Game(team1_id=sample_teams[2].id, team2_id=sample_teams[3].id, status='in_progress')
        db.session.add_all([game1, game2])
        db.session.commit()

        response = client.get('/api/games')

        assert response.status_code == 200
        data = json.loads(response.data)
        assert len(data['games']) == 2

    def test_get_games_filtered_by_status(self, client, db, sample_teams):
        """Test getting games filtered by status"""
        game1 = Game(team1_id=sample_teams[0].id, team2_id=sample_teams[1].id, status='scheduled')
        game2 = Game(team1_id=sample_teams[2].id, team2_id=sample_teams[3].id, status='in_progress')
        db.session.add_all([game1, game2])
        db.session.commit()

        response = client.get('/api/games?status=in_progress')

        assert response.status_code == 200
        data = json.loads(response.data)
        assert len(data['games']) == 1
        assert data['games'][0]['status'] == 'in_progress'

    def test_get_current_games(self, client, db, sample_teams):
        """Test getting only in-progress games"""
        game1 = Game(team1_id=sample_teams[0].id, team2_id=sample_teams[1].id, status='scheduled')
        game2 = Game(team1_id=sample_teams[2].id, team2_id=sample_teams[3].id, status='in_progress')
        db.session.add_all([game1, game2])
        db.session.commit()

        response = client.get('/api/games/current')

        assert response.status_code == 200
        data = json.loads(response.data)
        assert len(data['games']) == 1
        assert data['games'][0]['status'] == 'in_progress'

    def test_get_available_teams(self, client, db, sample_teams):
        """Test getting teams not currently playing"""
        # Teams 0 and 1 are playing
        game = Game(team1_id=sample_teams[0].id, team2_id=sample_teams[1].id, status='in_progress')
        db.session.add(game)
        db.session.commit()

        response = client.get('/api/games/available-teams')

        assert response.status_code == 200
        data = json.loads(response.data)
        team_ids = [team['id'] for team in data['teams']]

        # Teams 2 and 3 should be available
        assert sample_teams[2].id in team_ids
        assert sample_teams[3].id in team_ids
        # Teams 0 and 1 should not be available
        assert sample_teams[0].id not in team_ids
        assert sample_teams[1].id not in team_ids

    def test_get_available_teams_all_available(self, client, db, sample_teams):
        """Test when all teams are available"""
        response = client.get('/api/games/available-teams')

        assert response.status_code == 200
        data = json.loads(response.data)
        assert len(data['teams']) == 4

    def test_generate_game_success(self, client, db, sample_teams):
        """Test automatic game generation"""
        response = client.post('/api/games/generate')

        assert response.status_code == 201
        data = json.loads(response.data)
        assert 'id' in data
        assert data['status'] == 'in_progress'
        assert data['team1'] is not None
        assert data['team2'] is not None

    def test_generate_game_no_teams(self, client, db):
        """Test game generation with no teams"""
        response = client.post('/api/games/generate')

        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data

    def test_create_game_manually_success(self, client, db, sample_teams):
        """Test manual game creation"""
        response = client.post('/api/games',
            data=json.dumps({
                'team1_id': sample_teams[0].id,
                'team2_id': sample_teams[1].id
            }),
            content_type='application/json'
        )

        assert response.status_code == 201
        data = json.loads(response.data)
        assert data['status'] == 'scheduled'
        assert data['team1']['id'] == sample_teams[0].id
        assert data['team2']['id'] == sample_teams[1].id

    def test_create_game_manually_enforces_team_ordering(self, client, db, sample_teams):
        """Test that team ordering is enforced (team1_id < team2_id)"""
        # Pass teams in reverse order
        response = client.post('/api/games',
            data=json.dumps({
                'team1_id': sample_teams[1].id,
                'team2_id': sample_teams[0].id
            }),
            content_type='application/json'
        )

        assert response.status_code == 201
        data = json.loads(response.data)
        # Should be reordered
        assert data['team1']['id'] == sample_teams[0].id
        assert data['team2']['id'] == sample_teams[1].id

    def test_create_game_missing_fields(self, client, db):
        """Test game creation with missing fields"""
        response = client.post('/api/games',
            data=json.dumps({'team1_id': 1}),
            content_type='application/json'
        )

        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data

    def test_create_game_team_not_found(self, client, db, sample_teams):
        """Test game creation with non-existent team"""
        response = client.post('/api/games',
            data=json.dumps({
                'team1_id': sample_teams[0].id,
                'team2_id': 999
            }),
            content_type='application/json'
        )

        assert response.status_code == 404
        data = json.loads(response.data)
        assert 'error' in data

    def test_create_game_same_team(self, client, db, sample_teams):
        """Test that a team cannot play against itself"""
        response = client.post('/api/games',
            data=json.dumps({
                'team1_id': sample_teams[0].id,
                'team2_id': sample_teams[0].id
            }),
            content_type='application/json'
        )

        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data
        assert 'different' in data['error'].lower()

    def test_create_game_team_already_playing(self, client, db, sample_teams):
        """Test that busy teams cannot be in new games"""
        # Team 0 is already playing
        game = Game(team1_id=sample_teams[0].id, team2_id=sample_teams[1].id, status='in_progress')
        db.session.add(game)
        db.session.commit()

        # Try to create game with team 0
        response = client.post('/api/games',
            data=json.dumps({
                'team1_id': sample_teams[0].id,
                'team2_id': sample_teams[2].id
            }),
            content_type='application/json'
        )

        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data
        assert 'already playing' in data['error']

    def test_create_game_duplicate_matchup(self, client, db, sample_teams):
        """Test that duplicate matchups are prevented"""
        # Complete a game between teams 0 and 1
        game = Game(team1_id=sample_teams[0].id, team2_id=sample_teams[1].id, status='completed')
        db.session.add(game)
        db.session.commit()

        # Try to create the same matchup again
        response = client.post('/api/games',
            data=json.dumps({
                'team1_id': sample_teams[0].id,
                'team2_id': sample_teams[1].id
            }),
            content_type='application/json'
        )

        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data
        assert 'already played' in data['error']

    def test_start_game_success(self, client, db, sample_teams):
        """Test starting a scheduled game"""
        game = Game(team1_id=sample_teams[0].id, team2_id=sample_teams[1].id, status='scheduled')
        db.session.add(game)
        db.session.commit()

        response = client.post(f'/api/games/{game.id}/start')

        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['status'] == 'in_progress'
        assert data['started_at'] is not None

    def test_start_game_not_scheduled(self, client, db, sample_teams):
        """Test that only scheduled games can be started"""
        game = Game(team1_id=sample_teams[0].id, team2_id=sample_teams[1].id, status='in_progress')
        db.session.add(game)
        db.session.commit()

        response = client.post(f'/api/games/{game.id}/start')

        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data

    def test_start_game_not_found(self, client, db):
        """Test starting a non-existent game"""
        response = client.post('/api/games/999/start')
        assert response.status_code == 404

    def test_update_game_success(self, client, db, sample_teams):
        """Test updating a scheduled game"""
        game = Game(team1_id=sample_teams[0].id, team2_id=sample_teams[1].id, status='scheduled')
        db.session.add(game)
        db.session.commit()

        response = client.put(f'/api/games/{game.id}',
            data=json.dumps({
                'team1_id': sample_teams[2].id,
                'team2_id': sample_teams[3].id
            }),
            content_type='application/json'
        )

        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['team1']['id'] == sample_teams[2].id
        assert data['team2']['id'] == sample_teams[3].id

    def test_update_game_only_scheduled(self, client, db, sample_teams):
        """Test that only scheduled games can have teams updated"""
        game = Game(team1_id=sample_teams[0].id, team2_id=sample_teams[1].id, status='in_progress')
        db.session.add(game)
        db.session.commit()

        response = client.put(f'/api/games/{game.id}',
            data=json.dumps({
                'team1_id': sample_teams[2].id,
                'team2_id': sample_teams[3].id
            }),
            content_type='application/json'
        )

        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data

    def test_update_game_status(self, client, db, sample_teams):
        """Test updating game status"""
        game = Game(team1_id=sample_teams[0].id, team2_id=sample_teams[1].id, status='scheduled')
        db.session.add(game)
        db.session.commit()

        response = client.put(f'/api/games/{game.id}',
            data=json.dumps({'status': 'in_progress'}),
            content_type='application/json'
        )

        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['status'] == 'in_progress'

    def test_update_game_no_data(self, client, db, sample_teams):
        """Test update with no data"""
        game = Game(team1_id=sample_teams[0].id, team2_id=sample_teams[1].id, status='scheduled')
        db.session.add(game)
        db.session.commit()

        response = client.put(f'/api/games/{game.id}',
            data=json.dumps({}),
            content_type='application/json'
        )

        assert response.status_code == 400

    def test_delete_game_success(self, client, db, sample_teams):
        """Test deleting a scheduled game"""
        game = Game(team1_id=sample_teams[0].id, team2_id=sample_teams[1].id, status='scheduled')
        db.session.add(game)
        db.session.commit()
        game_id = game.id

        response = client.delete(f'/api/games/{game_id}')

        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'message' in data

        # Verify game is deleted
        assert Game.query.get(game_id) is None

    def test_delete_game_only_scheduled(self, client, db, sample_teams):
        """Test that only scheduled games can be deleted"""
        game = Game(team1_id=sample_teams[0].id, team2_id=sample_teams[1].id, status='in_progress')
        db.session.add(game)
        db.session.commit()

        response = client.delete(f'/api/games/{game.id}')

        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data

    def test_delete_game_not_found(self, client, db):
        """Test deleting a non-existent game"""
        response = client.delete('/api/games/999')
        assert response.status_code == 404

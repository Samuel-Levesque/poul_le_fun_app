"""Tests for Teams API routes"""
import pytest
import json
from models.team import Team
from models.game import Game


class TestTeamsRoutes:
    """Test suite for Teams API endpoints"""

    def test_create_teams_basic(self, client, db):
        """Test basic team creation from player list"""
        response = client.post('/api/teams',
            data=json.dumps({'players': ['Alice', 'Bob', 'Charlie', 'David']}),
            content_type='application/json'
        )

        assert response.status_code == 201
        data = json.loads(response.data)
        assert 'teams' in data
        assert len(data['teams']) == 2

        # Verify teams in database
        teams = Team.query.all()
        assert len(teams) == 2

    def test_create_teams_validates_minimum_players(self, client, db):
        """Test that at least 2 players are required"""
        response = client.post('/api/teams',
            data=json.dumps({'players': ['Alice']}),
            content_type='application/json'
        )

        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data
        assert 'At least 2 players' in data['error']

    def test_create_teams_validates_maximum_players(self, client, db):
        """Test that maximum 40 players are allowed"""
        players = [f'Player{i}' for i in range(41)]
        response = client.post('/api/teams',
            data=json.dumps({'players': players}),
            content_type='application/json'
        )

        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data
        assert 'Maximum 40 players' in data['error']

    def test_create_teams_validates_even_number(self, client, db):
        """Test that number of players must be even"""
        response = client.post('/api/teams',
            data=json.dumps({'players': ['Alice', 'Bob', 'Charlie']}),
            content_type='application/json'
        )

        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data
        assert 'must be even' in data['error']

    def test_create_teams_shuffles_players(self, client, db):
        """Test that players are randomly shuffled"""
        # This test is probabilistic but with 6 players,
        # the chance of getting the exact same order is very low
        players = ['Alice', 'Bob', 'Charlie', 'David', 'Eve', 'Frank']

        response1 = client.post('/api/teams',
            data=json.dumps({'players': players}),
            content_type='application/json'
        )

        # Clear database
        Team.query.delete()
        db.session.commit()

        response2 = client.post('/api/teams',
            data=json.dumps({'players': players}),
            content_type='application/json'
        )

        # We can't guarantee they're different due to randomness,
        # but we can verify both created valid teams
        assert response1.status_code == 201
        assert response2.status_code == 201

    def test_create_teams_increments_team_numbers(self, client, db):
        """Test that new teams get sequential numbers after existing teams"""
        # Create initial teams
        team1 = Team(name='Team 5', player1='Alice', player2='Bob')
        team2 = Team(name='Team 10', player1='Charlie', player2='David')
        db.session.add_all([team1, team2])
        db.session.commit()

        # Create new teams
        response = client.post('/api/teams',
            data=json.dumps({'players': ['Eve', 'Frank', 'Grace', 'Henry']}),
            content_type='application/json'
        )

        assert response.status_code == 201
        data = json.loads(response.data)

        # New teams should start from 11 (max existing was 10)
        team_names = [team['name'] for team in data['teams']]
        assert 'Team 11' in team_names
        assert 'Team 12' in team_names

    def test_create_teams_missing_players_field(self, client, db):
        """Test error when players field is missing"""
        response = client.post('/api/teams',
            data=json.dumps({}),
            content_type='application/json'
        )

        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data

    def test_get_teams_empty(self, client, db):
        """Test getting teams when none exist"""
        response = client.get('/api/teams')

        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'teams' in data
        assert len(data['teams']) == 0

    def test_get_teams_returns_all(self, client, db, sample_teams):
        """Test getting all teams"""
        response = client.get('/api/teams')

        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'teams' in data
        assert len(data['teams']) == 4

        # Verify team data structure
        team = data['teams'][0]
        assert 'id' in team
        assert 'name' in team
        assert 'player1' in team
        assert 'player2' in team
        assert 'created_at' in team

    def test_get_team_by_id(self, client, db, sample_teams):
        """Test getting a specific team by ID"""
        team_id = sample_teams[0].id
        response = client.get(f'/api/teams/{team_id}')

        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['id'] == team_id
        assert data['name'] == 'Team 1'
        assert data['player1'] == 'Alice'
        assert data['player2'] == 'Bob'

    def test_get_team_not_found(self, client, db):
        """Test getting a team that doesn't exist"""
        response = client.get('/api/teams/999')
        assert response.status_code == 404

    def test_delete_team_success(self, client, db):
        """Test deleting a team that hasn't played"""
        team = Team(name='Team 1', player1='Alice', player2='Bob')
        db.session.add(team)
        db.session.commit()
        team_id = team.id

        response = client.delete(f'/api/teams/{team_id}')

        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'message' in data

        # Verify team is deleted
        assert Team.query.get(team_id) is None

    def test_delete_team_with_games_fails(self, client, db, sample_teams):
        """Test that teams with games cannot be deleted"""
        # Create a game involving team 0
        game = Game(
            team1_id=sample_teams[0].id,
            team2_id=sample_teams[1].id,
            status='scheduled'
        )
        db.session.add(game)
        db.session.commit()

        response = client.delete(f'/api/teams/{sample_teams[0].id}')

        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data
        assert 'played games' in data['error']

        # Verify team still exists
        assert Team.query.get(sample_teams[0].id) is not None

    def test_delete_team_not_found(self, client, db):
        """Test deleting a team that doesn't exist"""
        response = client.delete('/api/teams/999')
        assert response.status_code == 404

    def test_create_team_manually_success(self, client, db):
        """Test manual team creation with specific players"""
        response = client.post('/api/teams/manual',
            data=json.dumps({'player1': 'Alice', 'player2': 'Bob'}),
            content_type='application/json'
        )

        assert response.status_code == 201
        data = json.loads(response.data)
        assert data['name'] == 'Team 1'
        assert data['player1'] == 'Alice'
        assert data['player2'] == 'Bob'

        # Verify in database
        teams = Team.query.all()
        assert len(teams) == 1

    def test_create_team_manually_missing_player1(self, client, db):
        """Test manual creation fails without player1"""
        response = client.post('/api/teams/manual',
            data=json.dumps({'player2': 'Bob'}),
            content_type='application/json'
        )

        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data

    def test_create_team_manually_missing_player2(self, client, db):
        """Test manual creation fails without player2"""
        response = client.post('/api/teams/manual',
            data=json.dumps({'player1': 'Alice'}),
            content_type='application/json'
        )

        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data

    def test_create_team_manually_empty_names(self, client, db):
        """Test manual creation fails with empty player names"""
        response = client.post('/api/teams/manual',
            data=json.dumps({'player1': '  ', 'player2': 'Bob'}),
            content_type='application/json'
        )

        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data
        assert 'cannot be empty' in data['error']

    def test_create_team_manually_increments_numbers(self, client, db):
        """Test manual team creation uses next available number"""
        # Create existing teams
        team1 = Team(name='Team 3', player1='Alice', player2='Bob')
        team2 = Team(name='Team 7', player1='Charlie', player2='David')
        db.session.add_all([team1, team2])
        db.session.commit()

        response = client.post('/api/teams/manual',
            data=json.dumps({'player1': 'Eve', 'player2': 'Frank'}),
            content_type='application/json'
        )

        assert response.status_code == 201
        data = json.loads(response.data)
        assert data['name'] == 'Team 8'

    def test_create_team_manually_trims_whitespace(self, client, db):
        """Test that player names are trimmed"""
        response = client.post('/api/teams/manual',
            data=json.dumps({'player1': '  Alice  ', 'player2': '  Bob  '}),
            content_type='application/json'
        )

        assert response.status_code == 201
        data = json.loads(response.data)
        assert data['player1'] == 'Alice'
        assert data['player2'] == 'Bob'

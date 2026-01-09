"""Integration tests for full tournament workflows"""
import pytest
import json
from models.team import Team
from models.game import Game
from models.result import Result


class TestTournamentWorkflow:
    """Integration tests for complete tournament flows"""

    def test_full_tournament_cycle(self, client, db):
        """Test complete tournament from team creation to rankings"""
        # Step 1: Create teams
        response = client.post('/api/teams',
            data=json.dumps({
                'players': ['Alice', 'Bob', 'Charlie', 'David', 'Eve', 'Frank']
            }),
            content_type='application/json'
        )
        assert response.status_code == 201
        teams_data = json.loads(response.data)
        assert len(teams_data['teams']) == 3

        # Step 2: Generate first game
        response = client.post('/api/games/generate')
        assert response.status_code == 201
        game1_data = json.loads(response.data)
        game1_id = game1_data['id']
        team1_id = game1_data['team1']['id']
        assert game1_data['status'] == 'in_progress'

        # Step 3: Submit result for first game
        response = client.post('/api/results',
            data=json.dumps({
                'game_id': game1_id,
                'winning_team_id': team1_id,
                'score': 15
            }),
            content_type='application/json'
        )
        assert response.status_code == 201

        # Step 4: Verify game is marked complete
        response = client.get(f'/api/games?status=completed')
        data = json.loads(response.data)
        assert len(data['games']) == 1

        # Step 5: Generate second game
        response = client.post('/api/games/generate')
        assert response.status_code == 201
        game2_data = json.loads(response.data)

        # Step 6: Submit result for second game
        response = client.post('/api/results',
            data=json.dumps({
                'game_id': game2_data['id'],
                'winning_team_id': game2_data['team1']['id'],
                'score': 20
            }),
            content_type='application/json'
        )
        assert response.status_code == 201

        # Step 7: Check rankings
        response = client.get('/api/rankings')
        assert response.status_code == 200
        rankings = json.loads(response.data)['rankings']
        assert len(rankings) == 3

        # Verify ranking has correct data
        top_team = rankings[0]
        assert top_team['rank'] == 1
        assert top_team['games_played'] >= 1
        assert top_team['total_score'] > 0

    def test_concurrent_games(self, client, db):
        """Test multiple games running concurrently"""
        # Create 4 teams
        response = client.post('/api/teams',
            data=json.dumps({
                'players': ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
            }),
            content_type='application/json'
        )
        assert response.status_code == 201

        # Generate two games (should use different teams)
        response1 = client.post('/api/games/generate')
        assert response1.status_code == 201
        game1 = json.loads(response1.data)

        response2 = client.post('/api/games/generate')
        assert response2.status_code == 201
        game2 = json.loads(response2.data)

        # Verify no team overlap
        game1_teams = {game1['team1']['id'], game1['team2']['id']}
        game2_teams = {game2['team1']['id'], game2['team2']['id']}
        assert game1_teams.isdisjoint(game2_teams)

        # Verify both games are in progress
        response = client.get('/api/games/current')
        current_games = json.loads(response.data)['games']
        assert len(current_games) == 2

    def test_matchup_exhaustion(self, client, db):
        """Test behavior when all matchups are exhausted"""
        # Create 3 teams (3 possible matchups)
        response = client.post('/api/teams',
            data=json.dumps({
                'players': ['Alice', 'Bob', 'Charlie', 'David', 'Eve', 'Frank']
            }),
            content_type='application/json'
        )
        assert response.status_code == 201

        # Play all 3 possible games
        for _ in range(3):
            # Generate game
            response = client.post('/api/games/generate')
            assert response.status_code == 201
            game = json.loads(response.data)

            # Complete game
            response = client.post('/api/results',
                data=json.dumps({
                    'game_id': game['id'],
                    'winning_team_id': game['team1']['id'],
                    'score': 10
                }),
                content_type='application/json'
            )
            assert response.status_code == 201

        # Try to generate 4th game (should fail)
        response = client.post('/api/games/generate')
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data

    def test_team_availability_tracking(self, client, db):
        """Test that team availability is correctly tracked"""
        # Create 4 teams
        response = client.post('/api/teams',
            data=json.dumps({
                'players': ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
            }),
            content_type='application/json'
        )
        assert response.status_code == 201

        # Initially all teams available
        response = client.get('/api/games/available-teams')
        available = json.loads(response.data)['teams']
        assert len(available) == 4

        # Start a game
        response = client.post('/api/games/generate')
        game = json.loads(response.data)
        busy_teams = {game['team1']['id'], game['team2']['id']}

        # Check availability
        response = client.get('/api/games/available-teams')
        available = json.loads(response.data)['teams']
        assert len(available) == 2

        available_ids = {t['id'] for t in available}
        assert available_ids.isdisjoint(busy_teams)

        # Complete the game
        response = client.post('/api/results',
            data=json.dumps({
                'game_id': game['id'],
                'winning_team_id': game['team1']['id'],
                'score': 10
            }),
            content_type='application/json'
        )
        assert response.status_code == 201

        # All teams available again
        response = client.get('/api/games/available-teams')
        available = json.loads(response.data)['teams']
        assert len(available) == 4

    def test_match_matrix_progression(self, client, db):
        """Test match matrix updates as tournament progresses"""
        # Create 3 teams
        response = client.post('/api/teams',
            data=json.dumps({
                'players': ['Alice', 'Bob', 'Charlie', 'David', 'Eve', 'Frank']
            }),
            content_type='application/json'
        )
        teams = json.loads(response.data)['teams']

        # Initially all matchups unplayed
        response = client.get('/api/match-matrix')
        data = json.loads(response.data)
        matrix = data['matrix']

        unplayed_count = 0
        for team1 in teams:
            for team2 in teams:
                if team1['id'] != team2['id']:
                    status = matrix[str(team1['id'])][str(team2['id'])]['status']
                    if status == 'unplayed':
                        unplayed_count += 1

        assert unplayed_count == 6  # 3 teams = 3 matchups * 2 directions

        # Generate and complete one game
        response = client.post('/api/games/generate')
        game = json.loads(response.data)

        # Check in-progress status in matrix
        response = client.get('/api/match-matrix')
        matrix = json.loads(response.data)['matrix']
        status = matrix[str(game['team1']['id'])][str(game['team2']['id'])]['status']
        assert status == 'in_progress'

        # Complete the game
        response = client.post('/api/results',
            data=json.dumps({
                'game_id': game['id'],
                'winning_team_id': game['team1']['id'],
                'score': 10
            }),
            content_type='application/json'
        )

        # Check completed status in matrix
        response = client.get('/api/match-matrix')
        matrix = json.loads(response.data)['matrix']
        status = matrix[str(game['team1']['id'])][str(game['team2']['id'])]['status']
        assert status == 'completed'

    def test_ranking_accuracy_over_multiple_games(self, client, db):
        """Test that rankings remain accurate across multiple games"""
        # Create 4 teams
        response = client.post('/api/teams',
            data=json.dumps({
                'players': ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
            }),
            content_type='application/json'
        )
        teams = json.loads(response.data)['teams']

        # Manually create specific matchups to test ranking
        # Team 0 will win 2 games with high scores
        # Team 1 will win 1 game with medium score
        # Team 2 will lose 2 games
        # Team 3 will lose 1 game

        # Game 1: Team 0 beats Team 2 (score 20)
        response = client.post('/api/games',
            data=json.dumps({
                'team1_id': teams[0]['id'],
                'team2_id': teams[2]['id']
            }),
            content_type='application/json'
        )
        game1 = json.loads(response.data)

        response = client.post(f'/api/games/{game1["id"]}/start')
        assert response.status_code == 200

        response = client.post('/api/results',
            data=json.dumps({
                'game_id': game1['id'],
                'winning_team_id': teams[0]['id'],
                'score': 20
            }),
            content_type='application/json'
        )

        # Game 2: Team 1 beats Team 3 (score 10)
        response = client.post('/api/games',
            data=json.dumps({
                'team1_id': teams[1]['id'],
                'team2_id': teams[3]['id']
            }),
            content_type='application/json'
        )
        game2 = json.loads(response.data)

        response = client.post(f'/api/games/{game2["id"]}/start')
        response = client.post('/api/results',
            data=json.dumps({
                'game_id': game2['id'],
                'winning_team_id': teams[1]['id'],
                'score': 10
            }),
            content_type='application/json'
        )

        # Game 3: Team 0 beats Team 3 (score 15)
        response = client.post('/api/games',
            data=json.dumps({
                'team1_id': teams[0]['id'],
                'team2_id': teams[3]['id']
            }),
            content_type='application/json'
        )
        game3 = json.loads(response.data)

        response = client.post(f'/api/games/{game3["id"]}/start')
        response = client.post('/api/results',
            data=json.dumps({
                'game_id': game3['id'],
                'winning_team_id': teams[0]['id'],
                'score': 15
            }),
            content_type='application/json'
        )

        # Check final rankings
        response = client.get('/api/rankings')
        rankings = json.loads(response.data)['rankings']

        # Team 0 should be rank 1 (35 points, 2 wins)
        team0_rank = next(r for r in rankings if r['team_id'] == teams[0]['id'])
        assert team0_rank['rank'] == 1
        assert team0_rank['total_score'] == 35
        assert team0_rank['games_won'] == 2
        assert team0_rank['games_played'] == 2

        # Team 1 should be rank 2 (10 points, 1 win)
        team1_rank = next(r for r in rankings if r['team_id'] == teams[1]['id'])
        assert team1_rank['rank'] == 2
        assert team1_rank['total_score'] == 10
        assert team1_rank['games_won'] == 1

    def test_database_clear_and_restart(self, client, db):
        """Test clearing database and starting new tournament"""
        # Create initial tournament
        response = client.post('/api/teams',
            data=json.dumps({'players': ['A', 'B', 'C', 'D']}),
            content_type='application/json'
        )
        assert response.status_code == 201

        response = client.post('/api/games/generate')
        game = json.loads(response.data)

        response = client.post('/api/results',
            data=json.dumps({
                'game_id': game['id'],
                'winning_team_id': game['team1']['id'],
                'score': 10
            }),
            content_type='application/json'
        )

        # Clear database
        response = client.post('/api/admin/clear-database')
        assert response.status_code == 200

        # Verify everything is cleared
        response = client.get('/api/teams')
        assert len(json.loads(response.data)['teams']) == 0

        response = client.get('/api/games')
        assert len(json.loads(response.data)['games']) == 0

        response = client.get('/api/results')
        assert len(json.loads(response.data)['results']) == 0

        # Start new tournament
        response = client.post('/api/teams',
            data=json.dumps({'players': ['W', 'X', 'Y', 'Z']}),
            content_type='application/json'
        )
        assert response.status_code == 201
        new_teams = json.loads(response.data)['teams']

        # Team numbering should restart from 1
        assert new_teams[0]['name'] == 'Team 1'

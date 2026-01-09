from flask import Blueprint, request, jsonify
from database import db
from models.team import Team
import random

teams_bp = Blueprint('teams', __name__)

@teams_bp.route('/teams', methods=['POST'])
def create_teams():
    """Create teams from a list of player names"""
    data = request.get_json()

    if not data or 'players' not in data:
        return jsonify({'error': 'players list is required'}), 400

    players = data['players']

    # Validate player count (need 2-40 players for 1-20 teams)
    if len(players) < 2:
        return jsonify({'error': 'At least 2 players required'}), 400
    if len(players) > 40:
        return jsonify({'error': 'Maximum 40 players allowed'}), 400
    if len(players) % 2 != 0:
        return jsonify({'error': 'Number of players must be even'}), 400

    # Shuffle players for random pairing
    shuffled_players = players.copy()
    random.shuffle(shuffled_players)

    # Get the highest team number from existing teams
    existing_teams = Team.query.all()
    max_team_number = 0
    for team in existing_teams:
        # Extract number from team name (e.g., "Team 5" -> 5)
        try:
            team_number = int(team.name.split()[-1])
            max_team_number = max(max_team_number, team_number)
        except (ValueError, IndexError):
            pass

    # Create teams starting from next available number
    teams = []
    for i in range(0, len(shuffled_players), 2):
        team_number = max_team_number + i//2 + 1
        team = Team(
            name=f'Team {team_number}',
            player1=shuffled_players[i],
            player2=shuffled_players[i + 1]
        )
        db.session.add(team)
        teams.append(team)

    db.session.commit()

    return jsonify({
        'teams': [team.to_dict() for team in teams]
    }), 201

@teams_bp.route('/teams', methods=['GET'])
def get_teams():
    """Get all teams"""
    teams = Team.query.all()
    return jsonify({
        'teams': [team.to_dict() for team in teams]
    }), 200

@teams_bp.route('/teams/<int:team_id>', methods=['GET'])
def get_team(team_id):
    """Get a single team by ID"""
    team = Team.query.get_or_404(team_id)
    return jsonify(team.to_dict()), 200

@teams_bp.route('/teams/<int:team_id>', methods=['DELETE'])
def delete_team(team_id):
    """Delete a team (only if they haven't played any games)"""
    from models.game import Game

    team = Team.query.get_or_404(team_id)

    # Check if team has played any games
    games_count = Game.query.filter(
        (Game.team1_id == team_id) | (Game.team2_id == team_id)
    ).count()

    if games_count > 0:
        return jsonify({'error': 'Cannot delete team that has played games'}), 400

    db.session.delete(team)
    db.session.commit()

    return jsonify({'message': 'Team deleted successfully'}), 200

@teams_bp.route('/teams/manual', methods=['POST'])
def create_team_manually():
    """Create a single team manually with specific player names"""
    data = request.get_json()

    if not data or 'player1' not in data or 'player2' not in data:
        return jsonify({'error': 'player1 and player2 are required'}), 400

    player1 = data['player1'].strip()
    player2 = data['player2'].strip()

    if not player1 or not player2:
        return jsonify({'error': 'Player names cannot be empty'}), 400

    # Get the highest team number from existing teams
    existing_teams = Team.query.all()
    max_team_number = 0
    for team in existing_teams:
        # Extract number from team name (e.g., "Team 5" -> 5)
        try:
            team_number = int(team.name.split()[-1])
            max_team_number = max(max_team_number, team_number)
        except (ValueError, IndexError):
            pass

    # Create team with next available number
    team_number = max_team_number + 1
    team = Team(
        name=f'Team {team_number}',
        player1=player1,
        player2=player2
    )
    db.session.add(team)
    db.session.commit()

    return jsonify(team.to_dict()), 201

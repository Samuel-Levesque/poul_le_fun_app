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

    # Validate player count (need 4-40 players for 2-20 teams)
    if len(players) < 4:
        return jsonify({'error': 'At least 4 players required'}), 400
    if len(players) > 40:
        return jsonify({'error': 'Maximum 40 players allowed'}), 400
    if len(players) % 2 != 0:
        return jsonify({'error': 'Number of players must be even'}), 400

    # Shuffle players for random pairing
    shuffled_players = players.copy()
    random.shuffle(shuffled_players)

    # Create teams
    teams = []
    for i in range(0, len(shuffled_players), 2):
        team = Team(
            name=f'Team {i//2 + 1}',
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

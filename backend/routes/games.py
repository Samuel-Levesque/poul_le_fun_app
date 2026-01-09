from flask import Blueprint, request, jsonify
from database import db
from models.game import Game
from models.team import Team
from datetime import datetime

games_bp = Blueprint('games', __name__)

@games_bp.route('/games', methods=['GET'])
def get_games():
    """Get all games, optionally filtered by status"""
    status = request.args.get('status')

    if status:
        games = Game.query.filter_by(status=status).all()
    else:
        games = Game.query.all()

    return jsonify({
        'games': [game.to_dict() for game in games]
    }), 200

@games_bp.route('/games/current', methods=['GET'])
def get_current_games():
    """Get all games currently in progress"""
    games = Game.query.filter_by(status='in_progress').all()
    return jsonify({
        'games': [game.to_dict() for game in games]
    }), 200

@games_bp.route('/games/available-teams', methods=['GET'])
def get_available_teams():
    """Get teams that are not currently playing"""
    # Get teams that are in in_progress games
    busy_team_ids = set()
    in_progress_games = Game.query.filter_by(status='in_progress').all()

    for game in in_progress_games:
        busy_team_ids.add(game.team1_id)
        busy_team_ids.add(game.team2_id)

    # Get all teams not in busy_team_ids
    all_teams = Team.query.all()
    available_teams = [team for team in all_teams if team.id not in busy_team_ids]

    return jsonify({
        'teams': [team.to_dict() for team in available_teams]
    }), 200

@games_bp.route('/games/generate', methods=['POST'])
def generate_game():
    """Generate the next fair game"""
    from services.game_generator import GameGenerator

    generator = GameGenerator(db)
    game = generator.generate_next_game()

    if not game:
        return jsonify({'error': 'No more games can be generated'}), 400

    return jsonify(game.to_dict()), 201

@games_bp.route('/games', methods=['POST'])
def create_game_manually():
    """Create a game manually"""
    data = request.get_json()

    if not data or 'team1_id' not in data or 'team2_id' not in data:
        return jsonify({'error': 'team1_id and team2_id are required'}), 400

    team1_id = data['team1_id']
    team2_id = data['team2_id']

    # Validate teams exist
    team1 = Team.query.get(team1_id)
    team2 = Team.query.get(team2_id)

    if not team1 or not team2:
        return jsonify({'error': 'One or both teams not found'}), 404

    # Validate teams are different
    if team1_id == team2_id:
        return jsonify({'error': 'Teams must be different'}), 400

    # Ensure team1_id < team2_id for consistency
    if team1_id > team2_id:
        team1_id, team2_id = team2_id, team1_id

    # Check if teams are already playing
    in_progress_games = Game.query.filter_by(status='in_progress').all()
    busy_team_ids = set()
    for game in in_progress_games:
        busy_team_ids.add(game.team1_id)
        busy_team_ids.add(game.team2_id)

    if team1_id in busy_team_ids or team2_id in busy_team_ids:
        return jsonify({'error': 'One or both teams are already playing'}), 400

    # Check if matchup already exists (completed games)
    existing_game = Game.query.filter_by(
        team1_id=team1_id,
        team2_id=team2_id,
        status='completed'
    ).first()

    if existing_game:
        return jsonify({'error': 'These teams have already played'}), 400

    # Create game
    game = Game(team1_id=team1_id, team2_id=team2_id)
    db.session.add(game)
    db.session.commit()

    return jsonify(game.to_dict()), 201

@games_bp.route('/games/<int:game_id>', methods=['PUT'])
def update_game(game_id):
    """Update a game (e.g., change teams or status)"""
    game = Game.query.get_or_404(game_id)
    data = request.get_json()

    if not data:
        return jsonify({'error': 'No data provided'}), 400

    # Update teams if provided (only if game is scheduled)
    if 'team1_id' in data or 'team2_id' in data:
        if game.status != 'scheduled':
            return jsonify({'error': 'Can only update teams for scheduled games'}), 400

        team1_id = data.get('team1_id', game.team1_id)
        team2_id = data.get('team2_id', game.team2_id)

        # Ensure ordering
        if team1_id > team2_id:
            team1_id, team2_id = team2_id, team1_id

        game.team1_id = team1_id
        game.team2_id = team2_id

    # Update status if provided
    if 'status' in data:
        game.status = data['status']

    db.session.commit()
    return jsonify(game.to_dict()), 200

@games_bp.route('/games/<int:game_id>/start', methods=['POST'])
def start_game(game_id):
    """Mark a game as in_progress"""
    game = Game.query.get_or_404(game_id)

    if game.status != 'scheduled':
        return jsonify({'error': 'Only scheduled games can be started'}), 400

    game.status = 'in_progress'
    game.started_at = datetime.utcnow()
    db.session.commit()

    return jsonify(game.to_dict()), 200

@games_bp.route('/games/<int:game_id>', methods=['DELETE'])
def delete_game(game_id):
    """Delete a scheduled game"""
    game = Game.query.get_or_404(game_id)

    if game.status != 'scheduled':
        return jsonify({'error': 'Can only delete scheduled games'}), 400

    db.session.delete(game)
    db.session.commit()

    return jsonify({'message': 'Game deleted successfully'}), 200

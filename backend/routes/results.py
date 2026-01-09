from flask import Blueprint, request, jsonify
from database import db
from models.result import Result
from models.game import Game
from models.team import Team
from datetime import datetime

results_bp = Blueprint('results', __name__)

@results_bp.route('/results', methods=['POST'])
def create_result():
    """Submit a result for a game"""
    data = request.get_json()

    if not data or 'game_id' not in data or 'winning_team_id' not in data or 'score' not in data:
        return jsonify({'error': 'game_id, winning_team_id, and score are required'}), 400

    game_id = data['game_id']
    winning_team_id = data['winning_team_id']
    score = data['score']

    # Validate game exists
    game = Game.query.get(game_id)
    if not game:
        return jsonify({'error': 'Game not found'}), 404

    # Validate game is in_progress
    if game.status != 'in_progress':
        return jsonify({'error': 'Can only submit results for in-progress games'}), 400

    # Validate winning team is one of the teams in the game
    if winning_team_id not in [game.team1_id, game.team2_id]:
        return jsonify({'error': 'Winning team must be one of the teams in the game'}), 400

    # Validate score is non-negative
    if score < 0:
        return jsonify({'error': 'Score must be non-negative'}), 400

    # Check if result already exists for this game
    existing_result = Result.query.filter_by(game_id=game_id).first()
    if existing_result:
        return jsonify({'error': 'Result already exists for this game'}), 400

    # Create result
    result = Result(
        game_id=game_id,
        winning_team_id=winning_team_id,
        score=score
    )
    db.session.add(result)

    # Update game status to completed
    game.status = 'completed'
    game.completed_at = datetime.utcnow()

    db.session.commit()

    return jsonify(result.to_dict()), 201

@results_bp.route('/results', methods=['GET'])
def get_results():
    """Get all results"""
    results = Result.query.all()
    return jsonify({
        'results': [result.to_dict() for result in results]
    }), 200

@results_bp.route('/results/<int:result_id>', methods=['GET'])
def get_result(result_id):
    """Get a single result by ID"""
    result = Result.query.get_or_404(result_id)
    return jsonify(result.to_dict()), 200

@results_bp.route('/rankings', methods=['GET'])
def get_rankings():
    """Get team rankings"""
    from services.ranking_service import RankingService

    ranking_service = RankingService(db)
    rankings = ranking_service.get_rankings()

    return jsonify({
        'rankings': rankings
    }), 200

@results_bp.route('/match-matrix', methods=['GET'])
def get_match_matrix():
    """Get match matrix showing all possible matchups and their status"""
    teams = Team.query.all()
    games = Game.query.filter(Game.status.in_(['completed', 'in_progress'])).all()

    # Create a lookup for games
    game_lookup = {}
    for game in games:
        key = (min(game.team1_id, game.team2_id), max(game.team1_id, game.team2_id))
        game_lookup[key] = {
            'game_id': game.id,
            'status': game.status
        }

    # Build matrix
    matrix = {}
    for team1 in teams:
        matrix[team1.id] = {}
        for team2 in teams:
            if team1.id == team2.id:
                matrix[team1.id][team2.id] = None
            else:
                key = (min(team1.id, team2.id), max(team1.id, team2.id))
                if key in game_lookup:
                    matrix[team1.id][team2.id] = game_lookup[key]
                else:
                    matrix[team1.id][team2.id] = {'status': 'unplayed'}

    return jsonify({
        'teams': [team.to_dict() for team in teams],
        'matrix': matrix
    }), 200

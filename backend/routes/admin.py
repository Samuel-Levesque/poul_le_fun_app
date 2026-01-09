from flask import Blueprint, jsonify
from database import db
from models.result import Result
from models.game import Game
from models.team import Team

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/clear-database', methods=['POST'])
def clear_database():
    """Clear all data from the database"""
    try:
        # Delete in proper order due to foreign key constraints
        # Results reference Games, Games reference Teams
        results_count = Result.query.count()
        Result.query.delete()

        games_count = Game.query.count()
        Game.query.delete()

        teams_count = Team.query.count()
        Team.query.delete()

        db.session.commit()

        return jsonify({
            'message': 'Database cleared successfully',
            'deleted': {
                'results': results_count,
                'games': games_count,
                'teams': teams_count
            }
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to clear database: {str(e)}'}), 500

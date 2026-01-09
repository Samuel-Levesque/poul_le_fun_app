"""Pytest configuration and fixtures for backend tests"""
import pytest
from app import create_app
from database import db as _db
from models.team import Team
from models.game import Game
from models.result import Result


@pytest.fixture(scope='function')
def app():
    """Create a Flask application configured for testing"""
    app = create_app()
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    with app.app_context():
        _db.create_all()
        yield app
        _db.session.remove()
        _db.drop_all()


@pytest.fixture(scope='function')
def db(app):
    """Get database instance"""
    return _db


@pytest.fixture(scope='function')
def client(app):
    """Create a test client"""
    return app.test_client()


@pytest.fixture(scope='function')
def sample_teams(db):
    """Create sample teams for testing"""
    teams = [
        Team(name='Team 1', player1='Alice', player2='Bob'),
        Team(name='Team 2', player1='Charlie', player2='David'),
        Team(name='Team 3', player1='Eve', player2='Frank'),
        Team(name='Team 4', player1='Grace', player2='Henry'),
    ]
    for team in teams:
        db.session.add(team)
    db.session.commit()
    return teams


@pytest.fixture(scope='function')
def sample_game(db, sample_teams):
    """Create a sample game for testing"""
    game = Game(
        team1_id=sample_teams[0].id,
        team2_id=sample_teams[1].id,
        status='scheduled'
    )
    db.session.add(game)
    db.session.commit()
    return game


@pytest.fixture(scope='function')
def in_progress_game(db, sample_teams):
    """Create a game in progress"""
    from datetime import datetime
    game = Game(
        team1_id=sample_teams[0].id,
        team2_id=sample_teams[1].id,
        status='in_progress',
        started_at=datetime.utcnow()
    )
    db.session.add(game)
    db.session.commit()
    return game


@pytest.fixture(scope='function')
def completed_game_with_result(db, sample_teams):
    """Create a completed game with a result"""
    from datetime import datetime
    game = Game(
        team1_id=sample_teams[0].id,
        team2_id=sample_teams[1].id,
        status='completed',
        started_at=datetime.utcnow(),
        completed_at=datetime.utcnow()
    )
    db.session.add(game)
    db.session.commit()

    result = Result(
        game_id=game.id,
        winning_team_id=sample_teams[0].id,
        score=10
    )
    db.session.add(result)
    db.session.commit()

    return game, result

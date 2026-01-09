from flask import Flask
from flask_cors import CORS
from config import Config
from database import db

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Configure CORS to allow requests from frontend
    CORS(app, resources={
        r"/api/*": {
            "origins": ["http://localhost:5173", "http://localhost:5174"],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type"]
        }
    })
    db.init_app(app)

    # Import models to ensure they're registered with SQLAlchemy
    from models import team, game, result

    # Import and register blueprints
    from routes.teams import teams_bp
    from routes.games import games_bp
    from routes.results import results_bp

    app.register_blueprint(teams_bp, url_prefix='/api')
    app.register_blueprint(games_bp, url_prefix='/api')
    app.register_blueprint(results_bp, url_prefix='/api')

    # Create database tables
    with app.app_context():
        db.create_all()

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=5000)

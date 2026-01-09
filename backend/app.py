from flask import Flask, request, make_response
from config import Config
from database import db

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)

    # Import models to ensure they're registered with SQLAlchemy
    from models import team, game, result

    # Import and register blueprints
    from routes.teams import teams_bp
    from routes.games import games_bp
    from routes.results import results_bp
    from routes.admin import admin_bp

    app.register_blueprint(teams_bp, url_prefix='/api')
    app.register_blueprint(games_bp, url_prefix='/api')
    app.register_blueprint(results_bp, url_prefix='/api')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')

    # Handle OPTIONS requests before routing
    @app.before_request
    def handle_preflight():
        if request.method == "OPTIONS":
            response = make_response('', 204)
            response.headers['Access-Control-Allow-Origin'] = '*'
            response.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization'
            response.headers['Access-Control-Allow-Methods'] = 'GET,POST,PUT,DELETE,OPTIONS'
            return response

    # Add CORS headers to all responses (must be AFTER blueprints)
    @app.after_request
    def after_request(response):
        response.headers['Access-Control-Allow-Origin'] = '*'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization'
        response.headers['Access-Control-Allow-Methods'] = 'GET,POST,PUT,DELETE,OPTIONS'
        return response

    # Create database tables
    with app.app_context():
        db.create_all()

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=5001)

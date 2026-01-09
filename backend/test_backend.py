#!/usr/bin/env python3
"""
Simple test script to verify the backend setup
"""
from app import create_app

def test_app():
    print("Creating Flask app...")
    app = create_app()

    print("✓ App created successfully!")
    print(f"✓ Database URI: {app.config['SQLALCHEMY_DATABASE_URI']}")

    with app.app_context():
        from database import db
        from models.team import Team
        from models.game import Game
        from models.result import Result

        # Check if tables exist
        print(f"✓ Team model loaded")
        print(f"✓ Game model loaded")
        print(f"✓ Result model loaded")

        # Try to query (will be empty but should work)
        teams = Team.query.all()
        print(f"✓ Database query successful (found {len(teams)} teams)")

    print("\n✅ Backend is ready to run!")
    print("Start it with: python app.py")

if __name__ == '__main__':
    test_app()

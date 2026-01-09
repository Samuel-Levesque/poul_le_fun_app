#!/usr/bin/env python3
"""
Diagnostic script to identify backend issues
"""
import sys
import os

print("=" * 60)
print("POUL LE FUN BACKEND DIAGNOSTICS")
print("=" * 60)
print()

# Check Python version
print(f"✓ Python version: {sys.version}")
print()

# Check we're in the right directory
print(f"Current directory: {os.getcwd()}")
if not os.path.exists('app.py'):
    print("❌ ERROR: Not in backend directory!")
    print("   Run: cd backend")
    sys.exit(1)
print("✓ In backend directory")
print()

# Check if venv exists
if os.path.exists('venv'):
    print("✓ Virtual environment exists")
else:
    print("❌ Virtual environment not found")
    print("   Run: python3 -m venv venv")
    sys.exit(1)
print()

# Check if Flask is installed
try:
    import flask
    print(f"✓ Flask installed (version {flask.__version__})")
except ImportError:
    print("❌ Flask not installed")
    print("   Run:")
    print("   source venv/bin/activate")
    print("   pip install -r requirements.txt")
    sys.exit(1)

# Check if Flask-CORS is installed
try:
    import flask_cors
    print(f"✓ Flask-CORS installed")
except ImportError:
    print("❌ Flask-CORS not installed")
    print("   Run: pip install -r requirements.txt")
    sys.exit(1)

# Check if Flask-SQLAlchemy is installed
try:
    import flask_sqlalchemy
    print(f"✓ Flask-SQLAlchemy installed")
except ImportError:
    print("❌ Flask-SQLAlchemy not installed")
    print("   Run: pip install -r requirements.txt")
    sys.exit(1)
print()

# Try to import our modules
try:
    from database import db
    print("✓ database module imports successfully")
except Exception as e:
    print(f"❌ Error importing database: {e}")
    sys.exit(1)

try:
    from models.team import Team
    print("✓ Team model imports successfully")
except Exception as e:
    print(f"❌ Error importing Team model: {e}")
    sys.exit(1)

try:
    from models.game import Game
    print("✓ Game model imports successfully")
except Exception as e:
    print(f"❌ Error importing Game model: {e}")
    sys.exit(1)

try:
    from models.result import Result
    print("✓ Result model imports successfully")
except Exception as e:
    print(f"❌ Error importing Result model: {e}")
    sys.exit(1)
print()

# Try to create the app
try:
    from app import create_app
    print("✓ app module imports successfully")

    app = create_app()
    print("✓ Flask app created successfully")
    print()

    # Check configuration
    with app.app_context():
        print(f"✓ Database URI: {app.config['SQLALCHEMY_DATABASE_URI']}")

        # Try to query database
        teams = Team.query.all()
        print(f"✓ Database query works ({len(teams)} teams in database)")

        # Check if tables exist
        from database import db
        inspector = db.inspect(db.engine)
        tables = inspector.get_table_names()
        print(f"✓ Database tables: {', '.join(tables)}")

except Exception as e:
    print(f"❌ Error creating app: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

print()
print("=" * 60)
print("✅ ALL CHECKS PASSED!")
print("=" * 60)
print()
print("Backend is ready to run!")
print("Start it with: python app.py")
print()

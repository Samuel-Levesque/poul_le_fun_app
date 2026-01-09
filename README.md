# Poul Le Fun Tournament App

Petite app web pour le tournoi Poul Le Fun!

A web application for managing card tournaments with automatic fair game generation, real-time scoring, and rankings.

## Features

- **Team Management**: Create teams from a list of players with random pairing
- **Fair Game Generation**: Algorithm ensures each team plays every other team once, with equal distribution
- **Live Game Tracking**: View all games currently in progress
- **Results & Scoring**: Enter game results with winning team and score
- **Rankings**: Real-time leaderboard with scores, wins, losses, and win rates
- **Match Matrix**: Visual 2D grid showing completed and remaining matchups

## Tech Stack

### Backend
- **Flask** - Python web framework
- **SQLAlchemy** - ORM for database management
- **SQLite** - Local database
- **Flask-CORS** - Cross-origin resource sharing

### Frontend
- **React** - UI library
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool
- **Material-UI** - Component library
- **React Router** - Client-side routing
- **Axios** - HTTP client

## Project Structure

```
poul_le_fun_app/
├── backend/
│   ├── app.py                    # Flask application
│   ├── config.py                 # Configuration
│   ├── requirements.txt          # Python dependencies
│   ├── models/                   # Database models
│   ├── routes/                   # API endpoints
│   └── services/                 # Business logic
└── frontend/
    ├── src/
    │   ├── api/                  # API client
    │   ├── components/           # React components
    │   ├── pages/                # Page components
    │   └── types/                # TypeScript types
    ├── package.json              # Node dependencies
    └── vite.config.ts            # Vite configuration
```

## Setup Instructions

### Backend Setup

**Quick Start (recommended):**
```bash
cd backend
./start.sh
```

**Or manually:**

1. Navigate to backend directory:
```bash
cd backend
```

2. Create and activate virtual environment:
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Run the Flask server:
```bash
python app.py
```

The backend will run on `http://localhost:5000`

**Test the backend:**
```bash
python test_backend.py
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## Usage

### 1. Create Teams

- Go to the **Teams** page
- Enter player names separated by commas
- Click "Create Teams" to generate random pairings
- Each team consists of 2 players

### 2. Generate and Play Games

- Go to the **Games** page
- Click "Generate Next Game" to get a fair matchup
- Or use "Manual Selection" to choose teams yourself
- Games are created in "scheduled" status
- When finished, click "Enter Result" to record the winner and score

### 3. View Rankings

- Go to the **Rankings** page
- See teams ranked by total score
- View wins, losses, games played, and win rates
- Top 3 teams are highlighted with medals

### 4. Check Match Matrix

- Go to the **Matrix** page
- See a visual grid of all possible matchups
- ✓ = Completed games
- ▶ = Games in progress
- - = Games not yet played

## API Endpoints

### Teams
- `POST /api/teams` - Create teams from player list
- `GET /api/teams` - Get all teams
- `DELETE /api/teams/:id` - Delete team

### Games
- `POST /api/games/generate` - Generate next game
- `POST /api/games` - Create game manually
- `GET /api/games` - Get all games
- `GET /api/games/current` - Get in-progress games
- `GET /api/games/available-teams` - Get teams not playing
- `POST /api/games/:id/start` - Start a game
- `PUT /api/games/:id` - Update game
- `DELETE /api/games/:id` - Delete game

### Results
- `POST /api/results` - Submit game result
- `GET /api/results` - Get all results
- `GET /api/rankings` - Get team rankings
- `GET /api/match-matrix` - Get match matrix

## Game Generation Algorithm

The app uses a fairness-based algorithm to generate games:

1. **Exclude busy teams**: Only considers teams not currently playing
2. **Filter played matchups**: Avoids duplicate games
3. **Score by fairness**: Prioritizes teams with fewer games played
4. **Balance distribution**: Minimizes variance in game counts

This ensures all teams play equally and no matchup is repeated.

## Testing

![Test Suite](https://github.com/Samuel-Levesque/poul_le_fun_app/actions/workflows/test.yml/badge.svg)

### Backend Tests (97% Coverage)

**112 passing tests** covering:
- Game generation algorithm
- Ranking calculations
- API endpoints
- Database models
- Full tournament workflows

Run tests:
```bash
cd backend
pytest                          # Run all tests
pytest --cov=. --cov-report=html  # With coverage report
```

### Frontend Tests

Comprehensive tests for:
- API client layer
- React components
- User interactions

Run tests:
```bash
cd frontend
npm test                        # Run all tests
npm run test:ui                 # Interactive UI
npm run test:coverage          # With coverage
```

### CI/CD Pipeline

Automated testing runs on every pull request:
- ✅ Backend tests with 97% coverage
- ✅ Frontend tests
- ✅ Branch protection enforced
- ✅ Tests must pass before merge

See [CI/CD Documentation](.github/workflows/README.md) for details.

## Development

### Backend Development

- Models are in `backend/models/`
- Routes (API endpoints) are in `backend/routes/`
- Business logic is in `backend/services/`
- Database is auto-created on first run
- Tests are in `backend/tests/`

### Frontend Development

- Components are in `frontend/src/components/`
- Pages are in `frontend/src/pages/`
- API calls are in `frontend/src/api/`
- Types are in `frontend/src/types/`
- Tests are in `frontend/src/**/__tests__/`

### Building for Production

Backend:
```bash
# Use a production WSGI server like Gunicorn
pip install gunicorn
gunicorn -w 4 app:create_app()
```

Frontend:
```bash
npm run build
# Serve the dist/ folder with a static file server
```

## License

This project was created for the Poul Le Fun tournament.

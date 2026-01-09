# Backend Test Suite

Comprehensive test suite for the Poul le Fun backend application.

## Test Structure

```
tests/
├── conftest.py              # Pytest fixtures and configuration
├── test_game_generator.py   # Tests for game generation service
├── test_ranking_service.py  # Tests for ranking calculations
├── test_teams_routes.py     # Tests for team management API
├── test_games_routes.py     # Tests for game management API
├── test_results_routes.py   # Tests for results and rankings API
├── test_admin_routes.py     # Tests for admin operations
├── test_models.py           # Tests for database models
└── test_integration.py      # End-to-end integration tests
```

## Running Tests

### Install Dependencies

```bash
pip install -r requirements.txt
```

### Run All Tests

```bash
cd backend
pytest
```

### Run Specific Test Files

```bash
pytest tests/test_game_generator.py
pytest tests/test_ranking_service.py
```

### Run with Coverage Report

```bash
pytest --cov=. --cov-report=html
```

Then open `htmlcov/index.html` in your browser to view the coverage report.

### Run with Verbose Output

```bash
pytest -v
```

## Test Categories

### Unit Tests
- **Services**: `test_game_generator.py`, `test_ranking_service.py`
- **Models**: `test_models.py`

### API Tests
- **Teams**: `test_teams_routes.py`
- **Games**: `test_games_routes.py`
- **Results**: `test_results_routes.py`
- **Admin**: `test_admin_routes.py`

### Integration Tests
- **Full Workflows**: `test_integration.py`

## Key Testing Areas

1. **Game Generation Logic** - Fairness algorithm, matchup deduplication, busy team handling
2. **Ranking Calculations** - Score accumulation, win rates, sorting
3. **API Validation** - Input validation, error handling, constraint enforcement
4. **Database Constraints** - Foreign keys, unique constraints, check constraints
5. **Business Logic** - Tournament workflows, concurrent games, team availability

## Coverage Goals

- **Line Coverage**: 80%+
- **Branch Coverage**: 75%+
- **Critical Paths**: 100%

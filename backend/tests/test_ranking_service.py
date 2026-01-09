"""Tests for RankingService"""
import pytest
from services.ranking_service import RankingService
from models.team import Team
from models.game import Game
from models.result import Result


class TestRankingService:
    """Test suite for RankingService"""

    def test_get_rankings_with_no_teams(self, app, db):
        """Test rankings with no teams"""
        service = RankingService(db)
        rankings = service.get_rankings()
        assert rankings == []

    def test_get_rankings_with_no_games(self, app, db, sample_teams):
        """Test rankings when teams have played no games"""
        service = RankingService(db)
        rankings = service.get_rankings()

        assert len(rankings) == 4
        for ranking in rankings:
            assert ranking['games_played'] == 0
            assert ranking['games_won'] == 0
            assert ranking['games_lost'] == 0
            assert ranking['total_score'] == 0
            assert ranking['win_rate'] == 0

    def test_get_rankings_basic(self, app, db, sample_teams):
        """Test basic ranking calculation"""
        # Team 0 beats Team 1 with score 10
        game = Game(
            team1_id=sample_teams[0].id,
            team2_id=sample_teams[1].id,
            status='completed'
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

        service = RankingService(db)
        rankings = service.get_rankings()

        # Find team 0 and team 1 in rankings
        team0_ranking = next(r for r in rankings if r['team_id'] == sample_teams[0].id)
        team1_ranking = next(r for r in rankings if r['team_id'] == sample_teams[1].id)

        # Team 0 should have 1 win
        assert team0_ranking['games_played'] == 1
        assert team0_ranking['games_won'] == 1
        assert team0_ranking['games_lost'] == 0
        assert team0_ranking['total_score'] == 10
        assert team0_ranking['win_rate'] == 1.0

        # Team 1 should have 1 loss
        assert team1_ranking['games_played'] == 1
        assert team1_ranking['games_won'] == 0
        assert team1_ranking['games_lost'] == 1
        assert team1_ranking['total_score'] == 0
        assert team1_ranking['win_rate'] == 0.0

    def test_get_rankings_sorting_by_total_score(self, app, db, sample_teams):
        """Test that rankings are sorted by total score (descending)"""
        # Team 0 wins with score 20
        game1 = Game(
            team1_id=sample_teams[0].id,
            team2_id=sample_teams[2].id,
            status='completed'
        )
        db.session.add(game1)
        db.session.commit()

        result1 = Result(
            game_id=game1.id,
            winning_team_id=sample_teams[0].id,
            score=20
        )
        db.session.add(result1)
        db.session.commit()

        # Team 1 wins with score 10
        game2 = Game(
            team1_id=sample_teams[1].id,
            team2_id=sample_teams[3].id,
            status='completed'
        )
        db.session.add(game2)
        db.session.commit()

        result2 = Result(
            game_id=game2.id,
            winning_team_id=sample_teams[1].id,
            score=10
        )
        db.session.add(result2)
        db.session.commit()

        service = RankingService(db)
        rankings = service.get_rankings()

        # Team 0 should be ranked 1st, Team 1 should be 2nd
        assert rankings[0]['team_id'] == sample_teams[0].id
        assert rankings[0]['rank'] == 1
        assert rankings[0]['total_score'] == 20

        assert rankings[1]['team_id'] == sample_teams[1].id
        assert rankings[1]['rank'] == 2
        assert rankings[1]['total_score'] == 10

    def test_get_rankings_sorting_by_win_rate_tiebreaker(self, app, db, sample_teams):
        """Test that win rate is used as tiebreaker when scores are equal"""
        # Team 0: 1 win with score 10 (played 1 game, win rate 1.0)
        game1 = Game(
            team1_id=sample_teams[0].id,
            team2_id=sample_teams[2].id,
            status='completed'
        )
        db.session.add(game1)
        db.session.commit()

        result1 = Result(
            game_id=game1.id,
            winning_team_id=sample_teams[0].id,
            score=10
        )
        db.session.add(result1)
        db.session.commit()

        # Team 1: 1 win with score 10, 1 loss (played 2 games, win rate 0.5)
        game2 = Game(
            team1_id=sample_teams[1].id,
            team2_id=sample_teams[3].id,
            status='completed'
        )
        db.session.add(game2)
        db.session.commit()

        result2 = Result(
            game_id=game2.id,
            winning_team_id=sample_teams[1].id,
            score=10
        )
        db.session.add(result2)
        db.session.commit()

        game3 = Game(
            team1_id=sample_teams[1].id,
            team2_id=sample_teams[2].id,
            status='completed'
        )
        db.session.add(game3)
        db.session.commit()

        result3 = Result(
            game_id=game3.id,
            winning_team_id=sample_teams[2].id,
            score=5
        )
        db.session.add(result3)
        db.session.commit()

        service = RankingService(db)
        rankings = service.get_rankings()

        # Both have score 10, but Team 0 has better win rate (1.0 vs 0.5)
        team0_ranking = next(r for r in rankings if r['team_id'] == sample_teams[0].id)
        team1_ranking = next(r for r in rankings if r['team_id'] == sample_teams[1].id)

        assert team0_ranking['total_score'] == team1_ranking['total_score'] == 10
        assert team0_ranking['rank'] < team1_ranking['rank']

    def test_get_rankings_multiple_wins_accumulate_score(self, app, db, sample_teams):
        """Test that multiple wins accumulate total score"""
        # Team 0 wins 2 games with scores 15 and 10
        game1 = Game(
            team1_id=sample_teams[0].id,
            team2_id=sample_teams[1].id,
            status='completed'
        )
        db.session.add(game1)
        db.session.commit()

        result1 = Result(
            game_id=game1.id,
            winning_team_id=sample_teams[0].id,
            score=15
        )
        db.session.add(result1)
        db.session.commit()

        game2 = Game(
            team1_id=sample_teams[0].id,
            team2_id=sample_teams[2].id,
            status='completed'
        )
        db.session.add(game2)
        db.session.commit()

        result2 = Result(
            game_id=game2.id,
            winning_team_id=sample_teams[0].id,
            score=10
        )
        db.session.add(result2)
        db.session.commit()

        service = RankingService(db)
        rankings = service.get_rankings()

        team0_ranking = next(r for r in rankings if r['team_id'] == sample_teams[0].id)
        assert team0_ranking['total_score'] == 25
        assert team0_ranking['games_won'] == 2
        assert team0_ranking['games_played'] == 2

    def test_get_rankings_includes_team_details(self, app, db, sample_teams):
        """Test that rankings include team name and player details"""
        service = RankingService(db)
        rankings = service.get_rankings()

        for ranking in rankings:
            assert 'team_id' in ranking
            assert 'team_name' in ranking
            assert 'players' in ranking
            assert len(ranking['players']) == 2

        team0_ranking = next(r for r in rankings if r['team_id'] == sample_teams[0].id)
        assert team0_ranking['team_name'] == 'Team 1'
        assert team0_ranking['players'] == ['Alice', 'Bob']

    def test_get_rankings_only_counts_completed_games(self, app, db, sample_teams):
        """Test that only completed games are counted in rankings"""
        # Completed game
        game1 = Game(
            team1_id=sample_teams[0].id,
            team2_id=sample_teams[1].id,
            status='completed'
        )
        db.session.add(game1)
        db.session.commit()

        result1 = Result(
            game_id=game1.id,
            winning_team_id=sample_teams[0].id,
            score=10
        )
        db.session.add(result1)
        db.session.commit()

        # In-progress game (should not be counted)
        game2 = Game(
            team1_id=sample_teams[0].id,
            team2_id=sample_teams[2].id,
            status='in_progress'
        )
        db.session.add(game2)
        db.session.commit()

        # Scheduled game (should not be counted)
        game3 = Game(
            team1_id=sample_teams[0].id,
            team2_id=sample_teams[3].id,
            status='scheduled'
        )
        db.session.add(game3)
        db.session.commit()

        service = RankingService(db)
        rankings = service.get_rankings()

        team0_ranking = next(r for r in rankings if r['team_id'] == sample_teams[0].id)
        # Should only count the completed game
        assert team0_ranking['games_played'] == 1
        assert team0_ranking['games_won'] == 1

    def test_get_rankings_win_rate_calculation(self, app, db, sample_teams):
        """Test accurate win rate calculation"""
        # Team 0: 2 wins, 1 loss (win rate 0.667)
        games = [
            Game(team1_id=sample_teams[0].id, team2_id=sample_teams[1].id, status='completed'),
            Game(team1_id=sample_teams[0].id, team2_id=sample_teams[2].id, status='completed'),
            Game(team1_id=sample_teams[0].id, team2_id=sample_teams[3].id, status='completed'),
        ]
        for game in games:
            db.session.add(game)
        db.session.commit()

        results = [
            Result(game_id=games[0].id, winning_team_id=sample_teams[0].id, score=10),
            Result(game_id=games[1].id, winning_team_id=sample_teams[0].id, score=10),
            Result(game_id=games[2].id, winning_team_id=sample_teams[3].id, score=10),
        ]
        for result in results:
            db.session.add(result)
        db.session.commit()

        service = RankingService(db)
        rankings = service.get_rankings()

        team0_ranking = next(r for r in rankings if r['team_id'] == sample_teams[0].id)
        assert team0_ranking['games_played'] == 3
        assert team0_ranking['games_won'] == 2
        assert team0_ranking['games_lost'] == 1
        assert team0_ranking['win_rate'] == pytest.approx(0.667, rel=0.01)

    def test_get_rankings_zero_score_wins_count(self, app, db, sample_teams):
        """Test that wins with zero score still count as wins"""
        game = Game(
            team1_id=sample_teams[0].id,
            team2_id=sample_teams[1].id,
            status='completed'
        )
        db.session.add(game)
        db.session.commit()

        result = Result(
            game_id=game.id,
            winning_team_id=sample_teams[0].id,
            score=0
        )
        db.session.add(result)
        db.session.commit()

        service = RankingService(db)
        rankings = service.get_rankings()

        team0_ranking = next(r for r in rankings if r['team_id'] == sample_teams[0].id)
        assert team0_ranking['games_won'] == 1
        assert team0_ranking['total_score'] == 0
        assert team0_ranking['win_rate'] == 1.0

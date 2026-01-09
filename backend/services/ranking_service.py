from models.team import Team
from models.game import Game
from models.result import Result
from sqlalchemy import func

class RankingService:
    def __init__(self, db):
        self.db = db

    def get_rankings(self):
        """Calculate and return team rankings"""
        teams = Team.query.all()
        rankings = []

        for team in teams:
            # Count games played
            games_played = Game.query.filter(
                ((Game.team1_id == team.id) | (Game.team2_id == team.id)) &
                (Game.status == 'completed')
            ).count()

            # Count wins
            wins = Result.query.filter_by(winning_team_id=team.id).count()

            # Calculate total score
            total_score = self.db.session.query(
                func.sum(Result.score)
            ).join(Game).filter(
                Result.winning_team_id == team.id
            ).scalar() or 0

            # Calculate losses
            losses = games_played - wins

            # Calculate win rate
            win_rate = wins / games_played if games_played > 0 else 0

            rankings.append({
                'team_id': team.id,
                'team_name': team.name,
                'players': [team.player1, team.player2],
                'total_score': int(total_score),
                'games_played': games_played,
                'games_won': wins,
                'games_lost': losses,
                'win_rate': round(win_rate, 3)
            })

        # Sort by total score (descending), then by win rate
        rankings.sort(key=lambda x: (x['total_score'], x['win_rate']), reverse=True)

        # Add rank
        for i, ranking in enumerate(rankings):
            ranking['rank'] = i + 1

        return rankings

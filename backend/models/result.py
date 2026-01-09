from database import db
from datetime import datetime

class Result(db.Model):
    __tablename__ = 'results'

    id = db.Column(db.Integer, primary_key=True)
    game_id = db.Column(db.Integer, db.ForeignKey('games.id'), unique=True, nullable=False)
    winning_team_id = db.Column(db.Integer, db.ForeignKey('teams.id'), nullable=False)
    score = db.Column(db.Integer, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    game = db.relationship('Game', backref=db.backref('result', uselist=False))
    winning_team = db.relationship('Team', foreign_keys=[winning_team_id])

    # Constraint: score must be non-negative
    __table_args__ = (
        db.CheckConstraint('score >= 0', name='check_positive_score'),
    )

    def to_dict(self):
        return {
            'id': self.id,
            'game_id': self.game_id,
            'winning_team_id': self.winning_team_id,
            'winning_team': self.winning_team.to_dict() if self.winning_team else None,
            'score': self.score,
            'created_at': self.created_at.isoformat()
        }

    def __repr__(self):
        return f'<Result {self.id}: Game {self.game_id}, Winner: Team {self.winning_team_id}, Score: {self.score}>'

from database import db
from datetime import datetime

class Game(db.Model):
    __tablename__ = 'games'

    id = db.Column(db.Integer, primary_key=True)
    team1_id = db.Column(db.Integer, db.ForeignKey('teams.id'), nullable=False)
    team2_id = db.Column(db.Integer, db.ForeignKey('teams.id'), nullable=False)
    status = db.Column(db.String(20), default='scheduled')  # scheduled, in_progress, completed
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    started_at = db.Column(db.DateTime, nullable=True)
    completed_at = db.Column(db.DateTime, nullable=True)

    # Relationships
    team1 = db.relationship('Team', foreign_keys=[team1_id], backref='games_as_team1')
    team2 = db.relationship('Team', foreign_keys=[team2_id], backref='games_as_team2')

    # Constraint: team1_id < team2_id to prevent duplicate games
    __table_args__ = (
        db.CheckConstraint('team1_id < team2_id', name='check_team_order'),
        db.CheckConstraint('team1_id != team2_id', name='check_different_teams'),
    )

    def to_dict(self):
        return {
            'id': self.id,
            'team1': self.team1.to_dict() if self.team1 else None,
            'team2': self.team2.to_dict() if self.team2 else None,
            'status': self.status,
            'created_at': self.created_at.isoformat(),
            'started_at': self.started_at.isoformat() if self.started_at else None,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None
        }

    def __repr__(self):
        return f'<Game {self.id}: Team {self.team1_id} vs Team {self.team2_id} ({self.status})>'

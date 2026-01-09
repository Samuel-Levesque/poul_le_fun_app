from database import db
from datetime import datetime

class Team(db.Model):
    __tablename__ = 'teams'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    player1 = db.Column(db.String(100), nullable=False)
    player2 = db.Column(db.String(100), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'player1': self.player1,
            'player2': self.player2,
            'created_at': self.created_at.isoformat()
        }

    def __repr__(self):
        return f'<Team {self.name}: {self.player1} & {self.player2}>'

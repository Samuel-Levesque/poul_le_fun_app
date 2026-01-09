import { Team } from './team';

export interface Result {
  id: number;
  game_id: number;
  winning_team_id: number;
  winning_team?: Team;
  score: number;
  created_at: string;
}

export interface Ranking {
  rank: number;
  team_id: number;
  team_name: string;
  players: string[];
  total_score: number;
  games_played: number;
  games_won: number;
  games_lost: number;
  win_rate: number;
}

import { Team } from './team';

export interface Game {
  id: number;
  team1: Team;
  team2: Team;
  status: 'scheduled' | 'in_progress' | 'completed';
  created_at: string;
  started_at?: string;
  completed_at?: string;
}

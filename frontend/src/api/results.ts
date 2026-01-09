import apiClient from './client';
import { Result, Ranking } from '../types/result';
import { Team } from '../types/team';

export const createResult = async (gameId: number, winningTeamId: number, score: number): Promise<Result> => {
  const response = await apiClient.post<Result>('/results', {
    game_id: gameId,
    winning_team_id: winningTeamId,
    score,
  });
  return response.data;
};

export const getResults = async (): Promise<Result[]> => {
  const response = await apiClient.get<{ results: Result[] }>('/results');
  return response.data.results;
};

export const getRankings = async (): Promise<Ranking[]> => {
  const response = await apiClient.get<{ rankings: Ranking[] }>('/rankings');
  return response.data.rankings;
};

export const getMatchMatrix = async (): Promise<{ teams: Team[]; matrix: any }> => {
  const response = await apiClient.get<{ teams: Team[]; matrix: any }>('/match-matrix');
  return response.data;
};

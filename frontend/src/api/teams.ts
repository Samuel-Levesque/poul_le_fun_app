import apiClient from './client';
import { Team } from '../types/team';

export const createTeams = async (players: string[]): Promise<Team[]> => {
  const response = await apiClient.post<{ teams: Team[] }>('/teams', { players });
  return response.data.teams;
};

export const getTeams = async (): Promise<Team[]> => {
  const response = await apiClient.get<{ teams: Team[] }>('/teams');
  return response.data.teams;
};

export const deleteTeam = async (teamId: number): Promise<void> => {
  await apiClient.delete(`/teams/${teamId}`);
};

export const createTeamManually = async (player1: string, player2: string): Promise<Team> => {
  const response = await apiClient.post<Team>('/teams/manual', { player1, player2 });
  return response.data;
};

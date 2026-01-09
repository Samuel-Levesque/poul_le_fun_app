import apiClient from './client';
import { Game } from '../types/game';
import { Team } from '../types/team';

export const generateGame = async (): Promise<Game> => {
  const response = await apiClient.post<Game>('/games/generate');
  return response.data;
};

export const createGameManually = async (team1Id: number, team2Id: number): Promise<Game> => {
  const response = await apiClient.post<Game>('/games', {
    team1_id: team1Id,
    team2_id: team2Id,
  });
  return response.data;
};

export const getGames = async (status?: string): Promise<Game[]> => {
  const params = status ? { status } : {};
  const response = await apiClient.get<{ games: Game[] }>('/games', { params });
  return response.data.games;
};

export const getCurrentGames = async (): Promise<Game[]> => {
  const response = await apiClient.get<{ games: Game[] }>('/games/current');
  return response.data.games;
};

export const getAvailableTeams = async (): Promise<Team[]> => {
  const response = await apiClient.get<{ teams: Team[] }>('/games/available-teams');
  return response.data.teams;
};

export const startGame = async (gameId: number): Promise<Game> => {
  const response = await apiClient.post<Game>(`/games/${gameId}/start`);
  return response.data;
};

export const updateGame = async (gameId: number, data: { team1_id?: number; team2_id?: number; status?: string }): Promise<Game> => {
  const response = await apiClient.put<Game>(`/games/${gameId}`, data);
  return response.data;
};

export const deleteGame = async (gameId: number): Promise<void> => {
  await apiClient.delete(`/games/${gameId}`);
};

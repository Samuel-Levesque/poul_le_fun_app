import apiClient from './client';

export const clearDatabase = async (): Promise<{ message: string; deleted: { results: number; games: number; teams: number } }> => {
  const response = await apiClient.post('/admin/clear-database');
  return response.data;
};

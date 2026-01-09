import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createTeams, getTeams, deleteTeam, createTeamManually } from '../teams'
import apiClient from '../client'

vi.mock('../client')

describe('Teams API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createTeams', () => {
    it('should create teams from player list', async () => {
      const mockTeams = [
        { id: 1, name: 'Team 1', player1: 'Alice', player2: 'Bob', created_at: '2024-01-01' },
        { id: 2, name: 'Team 2', player1: 'Charlie', player2: 'David', created_at: '2024-01-01' }
      ]

      vi.mocked(apiClient.post).mockResolvedValue({
        data: { teams: mockTeams }
      })

      const players = ['Alice', 'Bob', 'Charlie', 'David']
      const result = await createTeams(players)

      expect(apiClient.post).toHaveBeenCalledWith('/teams', { players })
      expect(result).toEqual(mockTeams)
    })

    it('should handle API errors', async () => {
      vi.mocked(apiClient.post).mockRejectedValue(new Error('API Error'))

      const players = ['Alice', 'Bob']
      await expect(createTeams(players)).rejects.toThrow('API Error')
    })
  })

  describe('getTeams', () => {
    it('should fetch all teams', async () => {
      const mockTeams = [
        { id: 1, name: 'Team 1', player1: 'Alice', player2: 'Bob', created_at: '2024-01-01' }
      ]

      vi.mocked(apiClient.get).mockResolvedValue({
        data: { teams: mockTeams }
      })

      const result = await getTeams()

      expect(apiClient.get).toHaveBeenCalledWith('/teams')
      expect(result).toEqual(mockTeams)
    })

    it('should return empty array when no teams exist', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        data: { teams: [] }
      })

      const result = await getTeams()

      expect(result).toEqual([])
    })
  })

  describe('deleteTeam', () => {
    it('should delete a team by ID', async () => {
      vi.mocked(apiClient.delete).mockResolvedValue({ data: {} })

      await deleteTeam(1)

      expect(apiClient.delete).toHaveBeenCalledWith('/teams/1')
    })

    it('should handle deletion errors', async () => {
      vi.mocked(apiClient.delete).mockRejectedValue(new Error('Cannot delete'))

      await expect(deleteTeam(1)).rejects.toThrow('Cannot delete')
    })
  })

  describe('createTeamManually', () => {
    it('should create a team with specific players', async () => {
      const mockTeam = {
        id: 1,
        name: 'Team 1',
        player1: 'Alice',
        player2: 'Bob',
        created_at: '2024-01-01'
      }

      vi.mocked(apiClient.post).mockResolvedValue({
        data: mockTeam
      })

      const result = await createTeamManually('Alice', 'Bob')

      expect(apiClient.post).toHaveBeenCalledWith('/teams/manual', {
        player1: 'Alice',
        player2: 'Bob'
      })
      expect(result).toEqual(mockTeam)
    })
  })
})

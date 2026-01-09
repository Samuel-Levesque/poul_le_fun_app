import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  generateGame,
  createGameManually,
  getGames,
  getCurrentGames,
  getAvailableTeams,
  startGame,
  updateGame,
  deleteGame
} from '../games'
import apiClient from '../client'

vi.mock('../client')

describe('Games API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('generateGame', () => {
    it('should generate a new game', async () => {
      const mockGame = {
        id: 1,
        team1: { id: 1, name: 'Team 1', player1: 'Alice', player2: 'Bob', created_at: '2024-01-01' },
        team2: { id: 2, name: 'Team 2', player1: 'Charlie', player2: 'David', created_at: '2024-01-01' },
        status: 'in_progress',
        created_at: '2024-01-01',
        started_at: '2024-01-01',
        completed_at: null
      }

      vi.mocked(apiClient.post).mockResolvedValue({ data: mockGame })

      const result = await generateGame()

      expect(apiClient.post).toHaveBeenCalledWith('/games/generate')
      expect(result).toEqual(mockGame)
    })
  })

  describe('createGameManually', () => {
    it('should create a game with specific teams', async () => {
      const mockGame = {
        id: 1,
        team1: { id: 1, name: 'Team 1', player1: 'Alice', player2: 'Bob', created_at: '2024-01-01' },
        team2: { id: 3, name: 'Team 3', player1: 'Eve', player2: 'Frank', created_at: '2024-01-01' },
        status: 'scheduled',
        created_at: '2024-01-01',
        started_at: null,
        completed_at: null
      }

      vi.mocked(apiClient.post).mockResolvedValue({ data: mockGame })

      const result = await createGameManually(1, 3)

      expect(apiClient.post).toHaveBeenCalledWith('/games', {
        team1_id: 1,
        team2_id: 3
      })
      expect(result).toEqual(mockGame)
    })
  })

  describe('getGames', () => {
    it('should fetch all games without filter', async () => {
      const mockGames = [
        {
          id: 1,
          team1: { id: 1, name: 'Team 1', player1: 'Alice', player2: 'Bob', created_at: '2024-01-01' },
          team2: { id: 2, name: 'Team 2', player1: 'Charlie', player2: 'David', created_at: '2024-01-01' },
          status: 'completed',
          created_at: '2024-01-01',
          started_at: '2024-01-01',
          completed_at: '2024-01-01'
        }
      ]

      vi.mocked(apiClient.get).mockResolvedValue({ data: { games: mockGames } })

      const result = await getGames()

      expect(apiClient.get).toHaveBeenCalledWith('/games', { params: {} })
      expect(result).toEqual(mockGames)
    })

    it('should fetch games with status filter', async () => {
      const mockGames = [
        {
          id: 1,
          team1: { id: 1, name: 'Team 1', player1: 'Alice', player2: 'Bob', created_at: '2024-01-01' },
          team2: { id: 2, name: 'Team 2', player1: 'Charlie', player2: 'David', created_at: '2024-01-01' },
          status: 'in_progress',
          created_at: '2024-01-01',
          started_at: '2024-01-01',
          completed_at: null
        }
      ]

      vi.mocked(apiClient.get).mockResolvedValue({ data: { games: mockGames } })

      const result = await getGames('in_progress')

      expect(apiClient.get).toHaveBeenCalledWith('/games', { params: { status: 'in_progress' } })
      expect(result).toEqual(mockGames)
    })
  })

  describe('getCurrentGames', () => {
    it('should fetch in-progress games', async () => {
      const mockGames = [
        {
          id: 1,
          team1: { id: 1, name: 'Team 1', player1: 'Alice', player2: 'Bob', created_at: '2024-01-01' },
          team2: { id: 2, name: 'Team 2', player1: 'Charlie', player2: 'David', created_at: '2024-01-01' },
          status: 'in_progress',
          created_at: '2024-01-01',
          started_at: '2024-01-01',
          completed_at: null
        }
      ]

      vi.mocked(apiClient.get).mockResolvedValue({ data: { games: mockGames } })

      const result = await getCurrentGames()

      expect(apiClient.get).toHaveBeenCalledWith('/games/current')
      expect(result).toEqual(mockGames)
    })
  })

  describe('getAvailableTeams', () => {
    it('should fetch teams not currently playing', async () => {
      const mockTeams = [
        { id: 3, name: 'Team 3', player1: 'Eve', player2: 'Frank', created_at: '2024-01-01' },
        { id: 4, name: 'Team 4', player1: 'Grace', player2: 'Henry', created_at: '2024-01-01' }
      ]

      vi.mocked(apiClient.get).mockResolvedValue({ data: { teams: mockTeams } })

      const result = await getAvailableTeams()

      expect(apiClient.get).toHaveBeenCalledWith('/games/available-teams')
      expect(result).toEqual(mockTeams)
    })
  })

  describe('startGame', () => {
    it('should start a scheduled game', async () => {
      const mockGame = {
        id: 1,
        team1: { id: 1, name: 'Team 1', player1: 'Alice', player2: 'Bob', created_at: '2024-01-01' },
        team2: { id: 2, name: 'Team 2', player1: 'Charlie', player2: 'David', created_at: '2024-01-01' },
        status: 'in_progress',
        created_at: '2024-01-01',
        started_at: '2024-01-01',
        completed_at: null
      }

      vi.mocked(apiClient.post).mockResolvedValue({ data: mockGame })

      const result = await startGame(1)

      expect(apiClient.post).toHaveBeenCalledWith('/games/1/start')
      expect(result.status).toBe('in_progress')
    })
  })

  describe('updateGame', () => {
    it('should update game teams', async () => {
      const mockGame = {
        id: 1,
        team1: { id: 2, name: 'Team 2', player1: 'Charlie', player2: 'David', created_at: '2024-01-01' },
        team2: { id: 3, name: 'Team 3', player1: 'Eve', player2: 'Frank', created_at: '2024-01-01' },
        status: 'scheduled',
        created_at: '2024-01-01',
        started_at: null,
        completed_at: null
      }

      vi.mocked(apiClient.put).mockResolvedValue({ data: mockGame })

      const result = await updateGame(1, { team1_id: 2, team2_id: 3 })

      expect(apiClient.put).toHaveBeenCalledWith('/games/1', {
        team1_id: 2,
        team2_id: 3
      })
      expect(result).toEqual(mockGame)
    })

    it('should update game status', async () => {
      const mockGame = {
        id: 1,
        team1: { id: 1, name: 'Team 1', player1: 'Alice', player2: 'Bob', created_at: '2024-01-01' },
        team2: { id: 2, name: 'Team 2', player1: 'Charlie', player2: 'David', created_at: '2024-01-01' },
        status: 'completed',
        created_at: '2024-01-01',
        started_at: '2024-01-01',
        completed_at: '2024-01-01'
      }

      vi.mocked(apiClient.put).mockResolvedValue({ data: mockGame })

      const result = await updateGame(1, { status: 'completed' })

      expect(apiClient.put).toHaveBeenCalledWith('/games/1', { status: 'completed' })
      expect(result.status).toBe('completed')
    })
  })

  describe('deleteGame', () => {
    it('should delete a game', async () => {
      vi.mocked(apiClient.delete).mockResolvedValue({ data: {} })

      await deleteGame(1)

      expect(apiClient.delete).toHaveBeenCalledWith('/games/1')
    })
  })
})

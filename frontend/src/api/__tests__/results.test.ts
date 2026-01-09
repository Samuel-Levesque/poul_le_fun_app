import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createResult, getResults, getRankings, getMatchMatrix } from '../results'
import apiClient from '../client'

vi.mock('../client')

describe('Results API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createResult', () => {
    it('should create a result for a game', async () => {
      const mockResult = {
        id: 1,
        game_id: 1,
        winning_team_id: 1,
        winning_team: { id: 1, name: 'Team 1', player1: 'Alice', player2: 'Bob', created_at: '2024-01-01' },
        score: 15,
        created_at: '2024-01-01'
      }

      vi.mocked(apiClient.post).mockResolvedValue({ data: mockResult })

      const result = await createResult(1, 1, 15)

      expect(apiClient.post).toHaveBeenCalledWith('/results', {
        game_id: 1,
        winning_team_id: 1,
        score: 15
      })
      expect(result).toEqual(mockResult)
    })

    it('should handle zero score', async () => {
      const mockResult = {
        id: 1,
        game_id: 1,
        winning_team_id: 1,
        winning_team: { id: 1, name: 'Team 1', player1: 'Alice', player2: 'Bob', created_at: '2024-01-01' },
        score: 0,
        created_at: '2024-01-01'
      }

      vi.mocked(apiClient.post).mockResolvedValue({ data: mockResult })

      const result = await createResult(1, 1, 0)

      expect(result.score).toBe(0)
    })
  })

  describe('getResults', () => {
    it('should fetch all results', async () => {
      const mockResults = [
        {
          id: 1,
          game_id: 1,
          winning_team_id: 1,
          winning_team: { id: 1, name: 'Team 1', player1: 'Alice', player2: 'Bob', created_at: '2024-01-01' },
          score: 15,
          created_at: '2024-01-01'
        },
        {
          id: 2,
          game_id: 2,
          winning_team_id: 2,
          winning_team: { id: 2, name: 'Team 2', player1: 'Charlie', player2: 'David', created_at: '2024-01-01' },
          score: 20,
          created_at: '2024-01-01'
        }
      ]

      vi.mocked(apiClient.get).mockResolvedValue({ data: { results: mockResults } })

      const result = await getResults()

      expect(apiClient.get).toHaveBeenCalledWith('/results')
      expect(result).toEqual(mockResults)
      expect(result).toHaveLength(2)
    })

    it('should return empty array when no results', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: { results: [] } })

      const result = await getResults()

      expect(result).toEqual([])
    })
  })

  describe('getRankings', () => {
    it('should fetch team rankings', async () => {
      const mockRankings = [
        {
          rank: 1,
          team_id: 1,
          team_name: 'Team 1',
          players: ['Alice', 'Bob'],
          total_score: 35,
          games_played: 2,
          games_won: 2,
          games_lost: 0,
          win_rate: 1.0
        },
        {
          rank: 2,
          team_id: 2,
          team_name: 'Team 2',
          players: ['Charlie', 'David'],
          total_score: 20,
          games_played: 2,
          games_won: 1,
          games_lost: 1,
          win_rate: 0.5
        }
      ]

      vi.mocked(apiClient.get).mockResolvedValue({ data: { rankings: mockRankings } })

      const result = await getRankings()

      expect(apiClient.get).toHaveBeenCalledWith('/rankings')
      expect(result).toEqual(mockRankings)
      expect(result[0].rank).toBe(1)
      expect(result[0].total_score).toBeGreaterThan(result[1].total_score)
    })

    it('should handle teams with no games', async () => {
      const mockRankings = [
        {
          rank: 1,
          team_id: 1,
          team_name: 'Team 1',
          players: ['Alice', 'Bob'],
          total_score: 0,
          games_played: 0,
          games_won: 0,
          games_lost: 0,
          win_rate: 0
        }
      ]

      vi.mocked(apiClient.get).mockResolvedValue({ data: { rankings: mockRankings } })

      const result = await getRankings()

      expect(result[0].games_played).toBe(0)
      expect(result[0].win_rate).toBe(0)
    })
  })

  describe('getMatchMatrix', () => {
    it('should fetch match matrix with teams', async () => {
      const mockTeams = [
        { id: 1, name: 'Team 1', player1: 'Alice', player2: 'Bob', created_at: '2024-01-01' },
        { id: 2, name: 'Team 2', player1: 'Charlie', player2: 'David', created_at: '2024-01-01' }
      ]

      const mockMatrix = {
        '1': {
          '1': null,
          '2': { game_id: 1, status: 'completed' }
        },
        '2': {
          '1': { game_id: 1, status: 'completed' },
          '2': null
        }
      }

      vi.mocked(apiClient.get).mockResolvedValue({
        data: { teams: mockTeams, matrix: mockMatrix }
      })

      const result = await getMatchMatrix()

      expect(apiClient.get).toHaveBeenCalledWith('/match-matrix')
      expect(result.teams).toEqual(mockTeams)
      expect(result.matrix).toEqual(mockMatrix)
    })

    it('should show unplayed matchups', async () => {
      const mockTeams = [
        { id: 1, name: 'Team 1', player1: 'Alice', player2: 'Bob', created_at: '2024-01-01' },
        { id: 2, name: 'Team 2', player1: 'Charlie', player2: 'David', created_at: '2024-01-01' }
      ]

      const mockMatrix = {
        '1': {
          '1': null,
          '2': { status: 'unplayed' }
        },
        '2': {
          '1': { status: 'unplayed' },
          '2': null
        }
      }

      vi.mocked(apiClient.get).mockResolvedValue({
        data: { teams: mockTeams, matrix: mockMatrix }
      })

      const result = await getMatchMatrix()

      expect(result.matrix['1']['2'].status).toBe('unplayed')
    })
  })
})

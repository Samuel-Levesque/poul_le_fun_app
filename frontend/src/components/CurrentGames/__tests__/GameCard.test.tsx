import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '../../../test/testUtils'
import userEvent from '@testing-library/user-event'
import GameCard from '../GameCard'
import { Game } from '../../../types/game'

// Mock the ResultEntryForm component
vi.mock('../../Results/ResultEntryForm', () => ({
  default: ({ onResultSubmitted, onCancel }: any) => (
    <div data-testid="result-entry-form">
      <button onClick={onResultSubmitted}>Submit Result</button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  )
}))

describe('GameCard', () => {
  const mockGame: Game = {
    id: 1,
    team1: {
      id: 1,
      name: 'Team 1',
      player1: 'Alice',
      player2: 'Bob',
      created_at: '2024-01-01'
    },
    team2: {
      id: 2,
      name: 'Team 2',
      player1: 'Charlie',
      player2: 'David',
      created_at: '2024-01-01'
    },
    status: 'in_progress',
    created_at: '2024-01-01',
    started_at: '2024-01-01',
    completed_at: null
  }

  it('should render game information correctly', () => {
    const mockOnResultSubmitted = vi.fn()
    render(<GameCard game={mockGame} onResultSubmitted={mockOnResultSubmitted} />)

    // Check game ID
    expect(screen.getByText('Game #1')).toBeInTheDocument()

    // Check team 1 details
    expect(screen.getByText('Team 1')).toBeInTheDocument()
    expect(screen.getByText('Alice & Bob')).toBeInTheDocument()

    // Check VS separator
    expect(screen.getByText('VS')).toBeInTheDocument()

    // Check team 2 details
    expect(screen.getByText('Team 2')).toBeInTheDocument()
    expect(screen.getByText('Charlie & David')).toBeInTheDocument()

    // Check Enter Result button
    expect(screen.getByRole('button', { name: /enter result/i })).toBeInTheDocument()
  })

  it('should open result form dialog when Enter Result is clicked', async () => {
    const user = userEvent.setup()
    const mockOnResultSubmitted = vi.fn()
    render(<GameCard game={mockGame} onResultSubmitted={mockOnResultSubmitted} />)

    // Initially, result form should not be visible
    expect(screen.queryByTestId('result-entry-form')).not.toBeInTheDocument()

    // Click Enter Result button
    const enterResultBtn = screen.getByRole('button', { name: /enter result/i })
    await user.click(enterResultBtn)

    // Result form should now be visible in dialog
    expect(screen.getByTestId('result-entry-form')).toBeInTheDocument()
    expect(screen.getByText('Enter Game Result')).toBeInTheDocument()
  })

  it('should close dialog when result is submitted', async () => {
    const user = userEvent.setup()
    const mockOnResultSubmitted = vi.fn()
    render(<GameCard game={mockGame} onResultSubmitted={mockOnResultSubmitted} />)

    // Open the dialog
    await user.click(screen.getByRole('button', { name: /enter result/i }))
    expect(screen.getByTestId('result-entry-form')).toBeInTheDocument()

    // Submit result
    await user.click(screen.getByRole('button', { name: /submit result/i }))

    // Dialog should close and callback should be called
    expect(screen.queryByTestId('result-entry-form')).not.toBeInTheDocument()
    expect(mockOnResultSubmitted).toHaveBeenCalledTimes(1)
  })

  it('should close dialog when cancel is clicked', async () => {
    const user = userEvent.setup()
    const mockOnResultSubmitted = vi.fn()
    render(<GameCard game={mockGame} onResultSubmitted={mockOnResultSubmitted} />)

    // Open the dialog
    await user.click(screen.getByRole('button', { name: /enter result/i }))
    expect(screen.getByTestId('result-entry-form')).toBeInTheDocument()

    // Click cancel
    await user.click(screen.getByRole('button', { name: /cancel/i }))

    // Dialog should close without calling the callback
    expect(screen.queryByTestId('result-entry-form')).not.toBeInTheDocument()
    expect(mockOnResultSubmitted).not.toHaveBeenCalled()
  })

  it('should display correct team names in chips', () => {
    const mockOnResultSubmitted = vi.fn()
    render(<GameCard game={mockGame} onResultSubmitted={mockOnResultSubmitted} />)

    const team1Chip = screen.getByText('Team 1')
    const team2Chip = screen.getByText('Team 2')

    expect(team1Chip).toBeInTheDocument()
    expect(team2Chip).toBeInTheDocument()
  })
})

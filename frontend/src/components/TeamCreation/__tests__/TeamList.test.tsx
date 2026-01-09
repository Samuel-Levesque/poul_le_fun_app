import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '../../../test/testUtils'
import userEvent from '@testing-library/user-event'
import TeamList from '../TeamList'
import { Team } from '../../../types/team'
import * as teamsApi from '../../../api/teams'

vi.mock('../../../api/teams')

describe('TeamList', () => {
  const mockTeams: Team[] = [
    { id: 1, name: 'Team 1', player1: 'Alice', player2: 'Bob', created_at: '2024-01-01' },
    { id: 2, name: 'Team 2', player1: 'Charlie', player2: 'David', created_at: '2024-01-01' },
    { id: 3, name: 'Team 3', player1: 'Eve', player2: 'Frank', created_at: '2024-01-01' }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should display message when no teams exist', () => {
    const mockOnTeamDeleted = vi.fn()
    render(<TeamList teams={[]} onTeamDeleted={mockOnTeamDeleted} />)

    expect(screen.getByText(/no teams created yet/i)).toBeInTheDocument()
  })

  it('should render all teams with correct information', () => {
    const mockOnTeamDeleted = vi.fn()
    render(<TeamList teams={mockTeams} onTeamDeleted={mockOnTeamDeleted} />)

    // Check header with count
    expect(screen.getByText('Teams (3)')).toBeInTheDocument()

    // Check each team is displayed
    expect(screen.getByText('Team 1')).toBeInTheDocument()
    expect(screen.getByText('Alice & Bob')).toBeInTheDocument()

    expect(screen.getByText('Team 2')).toBeInTheDocument()
    expect(screen.getByText('Charlie & David')).toBeInTheDocument()

    expect(screen.getByText('Team 3')).toBeInTheDocument()
    expect(screen.getByText('Eve & Frank')).toBeInTheDocument()
  })

  it('should display delete buttons for each team', () => {
    const mockOnTeamDeleted = vi.fn()
    render(<TeamList teams={mockTeams} onTeamDeleted={mockOnTeamDeleted} />)

    const deleteButtons = screen.getAllByLabelText('delete')
    expect(deleteButtons).toHaveLength(3)
  })

  it('should open confirmation dialog when delete is clicked', async () => {
    const user = userEvent.setup()
    const mockOnTeamDeleted = vi.fn()
    render(<TeamList teams={mockTeams} onTeamDeleted={mockOnTeamDeleted} />)

    // Click first delete button
    const deleteButtons = screen.getAllByLabelText('delete')
    await user.click(deleteButtons[0])

    // Check dialog is open with correct team info
    expect(screen.getByText('Delete Team')).toBeInTheDocument()
    expect(screen.getByText(/are you sure you want to delete/i)).toBeInTheDocument()
    expect(screen.getByText('Team 1')).toBeInTheDocument()
    expect(screen.getByText(/Alice & Bob/)).toBeInTheDocument()
  })

  it('should close dialog when cancel is clicked', async () => {
    const user = userEvent.setup()
    const mockOnTeamDeleted = vi.fn()
    render(<TeamList teams={mockTeams} onTeamDeleted={mockOnTeamDeleted} />)

    // Open dialog
    const deleteButtons = screen.getAllByLabelText('delete')
    await user.click(deleteButtons[0])

    // Click cancel
    const cancelButton = screen.getByRole('button', { name: /cancel/i })
    await user.click(cancelButton)

    // Dialog should close
    await waitFor(() => {
      expect(screen.queryByText('Delete Team')).not.toBeInTheDocument()
    })
  })

  it('should successfully delete a team', async () => {
    const user = userEvent.setup()
    const mockOnTeamDeleted = vi.fn()
    vi.mocked(teamsApi.deleteTeam).mockResolvedValue()

    render(<TeamList teams={mockTeams} onTeamDeleted={mockOnTeamDeleted} />)

    // Open dialog
    const deleteButtons = screen.getAllByLabelText('delete')
    await user.click(deleteButtons[0])

    // Confirm delete
    const deleteButton = screen.getByRole('button', { name: /^delete$/i })
    await user.click(deleteButton)

    // Wait for API call and callback
    await waitFor(() => {
      expect(teamsApi.deleteTeam).toHaveBeenCalledWith(1)
      expect(mockOnTeamDeleted).toHaveBeenCalledWith(1)
    })
  })

  it('should display error when delete fails', async () => {
    const user = userEvent.setup()
    const mockOnTeamDeleted = vi.fn()
    const errorMessage = 'Cannot delete team that has played games'

    vi.mocked(teamsApi.deleteTeam).mockRejectedValue({
      response: { data: { error: errorMessage } }
    })

    render(<TeamList teams={mockTeams} onTeamDeleted={mockOnTeamDeleted} />)

    // Open dialog
    const deleteButtons = screen.getAllByLabelText('delete')
    await user.click(deleteButtons[0])

    // Confirm delete
    const deleteButton = screen.getByRole('button', { name: /^delete$/i })
    await user.click(deleteButton)

    // Error should be displayed
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument()
    })

    // Callback should not be called
    expect(mockOnTeamDeleted).not.toHaveBeenCalled()

    // Dialog should still be open
    expect(screen.getByText('Delete Team')).toBeInTheDocument()
  })

  it('should show loading state while deleting', async () => {
    const user = userEvent.setup()
    const mockOnTeamDeleted = vi.fn()

    // Create a promise that we can control
    let resolveDelete: () => void
    const deletePromise = new Promise<void>((resolve) => {
      resolveDelete = resolve
    })
    vi.mocked(teamsApi.deleteTeam).mockReturnValue(deletePromise)

    render(<TeamList teams={mockTeams} onTeamDeleted={mockOnTeamDeleted} />)

    // Open dialog
    const deleteButtons = screen.getAllByLabelText('delete')
    await user.click(deleteButtons[0])

    // Confirm delete
    const deleteButton = screen.getByRole('button', { name: /^delete$/i })
    await user.click(deleteButton)

    // Should show "Deleting..." state
    await waitFor(() => {
      expect(screen.getByText('Deleting...')).toBeInTheDocument()
    })

    // Buttons should be disabled
    expect(screen.getByRole('button', { name: /cancel/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /deleting/i })).toBeDisabled()

    // Resolve the delete
    resolveDelete!()
  })

  it('should display warning about teams with games', async () => {
    const user = userEvent.setup()
    const mockOnTeamDeleted = vi.fn()
    render(<TeamList teams={mockTeams} onTeamDeleted={mockOnTeamDeleted} />)

    // Open dialog
    const deleteButtons = screen.getAllByLabelText('delete')
    await user.click(deleteButtons[0])

    // Check warning message
    expect(screen.getByText(/teams that have played games cannot be deleted/i)).toBeInTheDocument()
  })
})

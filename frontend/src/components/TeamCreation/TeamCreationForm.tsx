import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  Paper,
} from '@mui/material';
import { createTeams } from '../../api/teams';
import { Team } from '../../types/team';

interface TeamCreationFormProps {
  onTeamsCreated: (teams: Team[]) => void;
}

const TeamCreationForm: React.FC<TeamCreationFormProps> = ({ onTeamsCreated }) => {
  const [playerInput, setPlayerInput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Parse player names (comma-separated)
    const players = playerInput
      .split(',')
      .map(p => p.trim())
      .filter(p => p.length > 0);

    // Validate
    if (players.length < 4) {
      setError('Please enter at least 4 player names');
      return;
    }

    if (players.length > 40) {
      setError('Maximum 40 players allowed');
      return;
    }

    if (players.length % 2 !== 0) {
      setError('Number of players must be even');
      return;
    }

    // Check for duplicates
    const uniquePlayers = new Set(players);
    if (uniquePlayers.size !== players.length) {
      setError('Player names must be unique');
      return;
    }

    setLoading(true);

    try {
      const teams = await createTeams(players);
      onTeamsCreated(teams);
      setPlayerInput('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create teams');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h5" gutterBottom>
        Create Teams
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Enter player names separated by commas (e.g., Alice, Bob, Charlie, Diana)
      </Typography>

      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
        <TextField
          fullWidth
          multiline
          rows={4}
          label="Player Names"
          placeholder="Alice, Bob, Charlie, Diana, Eve, Frank..."
          value={playerInput}
          onChange={(e) => setPlayerInput(e.target.value)}
          disabled={loading}
          sx={{ mb: 2 }}
        />

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={loading || !playerInput.trim()}
          fullWidth
        >
          {loading ? 'Creating Teams...' : 'Create Teams'}
        </Button>
      </Box>
    </Paper>
  );
};

export default TeamCreationForm;

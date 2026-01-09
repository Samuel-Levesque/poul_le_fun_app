import React, { useState } from 'react';
import {
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
} from '@mui/material';
import { createTeamManually } from '../../api/teams';
import { Team } from '../../types/team';

interface ManualTeamCreationProps {
  onTeamCreated: (team: Team) => void;
}

const ManualTeamCreation: React.FC<ManualTeamCreationProps> = ({ onTeamCreated }) => {
  const [player1, setPlayer1] = useState('');
  const [player2, setPlayer2] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!player1.trim() || !player2.trim()) {
      setError('Both player names are required');
      return;
    }

    setLoading(true);

    try {
      const team = await createTeamManually(player1.trim(), player2.trim());
      onTeamCreated(team);
      setPlayer1('');
      setPlayer2('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create team');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h5" gutterBottom>
        Create Single Team Manually
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Enter two player names to create a specific team pairing.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit}>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField
            fullWidth
            label="Player 1"
            value={player1}
            onChange={(e) => setPlayer1(e.target.value)}
            disabled={loading}
            placeholder="Enter first player name"
          />
          <TextField
            fullWidth
            label="Player 2"
            value={player2}
            onChange={(e) => setPlayer2(e.target.value)}
            disabled={loading}
            placeholder="Enter second player name"
          />
        </Box>

        <Button
          type="submit"
          variant="contained"
          disabled={loading || !player1.trim() || !player2.trim()}
          fullWidth
        >
          {loading ? 'Creating...' : 'Create Team'}
        </Button>
      </Box>
    </Paper>
  );
};

export default ManualTeamCreation;

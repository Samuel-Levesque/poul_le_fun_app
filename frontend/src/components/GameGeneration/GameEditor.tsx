import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { createGameManually } from '../../api/games';
import { Team } from '../../types/team';

interface GameEditorProps {
  availableTeams: Team[];
  onGameCreated: () => void;
  onCancel: () => void;
}

const GameEditor: React.FC<GameEditorProps> = ({ availableTeams, onGameCreated, onCancel }) => {
  const [team1Id, setTeam1Id] = useState<number | ''>('');
  const [team2Id, setTeam2Id] = useState<number | ''>('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!team1Id || !team2Id) {
      setError('Please select both teams');
      return;
    }

    if (team1Id === team2Id) {
      setError('Teams must be different');
      return;
    }

    setLoading(true);

    try {
      await createGameManually(team1Id as number, team2Id as number);
      onGameCreated();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create game');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Typography variant="h6" gutterBottom>
        Manual Game Selection
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Team 1</InputLabel>
        <Select
          value={team1Id}
          label="Team 1"
          onChange={(e) => setTeam1Id(e.target.value as number)}
          disabled={loading}
        >
          {availableTeams.map((team) => (
            <MenuItem key={team.id} value={team.id} disabled={team.id === team2Id}>
              {team.name}: {team.player1} & {team.player2}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Team 2</InputLabel>
        <Select
          value={team2Id}
          label="Team 2"
          onChange={(e) => setTeam2Id(e.target.value as number)}
          disabled={loading}
        >
          {availableTeams.map((team) => (
            <MenuItem key={team.id} value={team.id} disabled={team.id === team1Id}>
              {team.name}: {team.player1} & {team.player2}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={loading || !team1Id || !team2Id}
          fullWidth
        >
          {loading ? 'Creating...' : 'Create Game'}
        </Button>
        <Button
          variant="outlined"
          onClick={onCancel}
          disabled={loading}
          fullWidth
        >
          Cancel
        </Button>
      </Box>
    </Box>
  );
};

export default GameEditor;

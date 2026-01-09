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
      setError('Veuillez sélectionner les deux poulaillers');
      return;
    }

    if (team1Id === team2Id) {
      setError('Les poulaillers doivent être différents');
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
        ✋ Sélection Manuelle de Partie
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Poulailler 1</InputLabel>
        <Select
          value={team1Id}
          label="Poulailler 1"
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
        <InputLabel>Poulailler 2</InputLabel>
        <Select
          value={team2Id}
          label="Poulailler 2"
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
          {loading ? '🥚 Création...' : '🎮 Créer la Partie'}
        </Button>
        <Button
          variant="outlined"
          onClick={onCancel}
          disabled={loading}
          fullWidth
        >
          Annuler
        </Button>
      </Box>
    </Box>
  );
};

export default GameEditor;

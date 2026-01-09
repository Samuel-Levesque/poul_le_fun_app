import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Alert,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
} from '@mui/material';
import { createResult } from '../../api/results';
import { Game } from '../../types/game';

interface ResultEntryFormProps {
  game: Game;
  onResultSubmitted: () => void;
  onCancel: () => void;
}

const ResultEntryForm: React.FC<ResultEntryFormProps> = ({ game, onResultSubmitted, onCancel }) => {
  const [winningTeamId, setWinningTeamId] = useState<number | null>(null);
  const [score, setScore] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!winningTeamId) {
      setError('Please select the winning team');
      return;
    }

    const scoreNum = parseInt(score);
    if (isNaN(scoreNum) || scoreNum < 0) {
      setError('Please enter a valid score (non-negative number)');
      return;
    }

    setLoading(true);

    try {
      await createResult(game.id, winningTeamId, scoreNum);
      onResultSubmitted();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to submit result');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ pt: 2 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <FormControl component="fieldset" sx={{ mb: 3, width: '100%' }}>
        <FormLabel component="legend">Select Winning Team</FormLabel>
        <RadioGroup
          value={winningTeamId}
          onChange={(e) => setWinningTeamId(parseInt(e.target.value))}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
            <Box
              sx={{
                p: 2,
                border: winningTeamId === game.team1.id ? '2px solid #1976d2' : '1px solid #e0e0e0',
                borderRadius: 1,
                cursor: 'pointer',
                '&:hover': { backgroundColor: '#f5f5f5' },
              }}
              onClick={() => setWinningTeamId(game.team1.id)}
            >
              <FormControlLabel
                value={game.team1.id}
                control={<Radio />}
                label={
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {game.team1.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {game.team1.player1} & {game.team1.player2}
                    </Typography>
                  </Box>
                }
              />
            </Box>

            <Box
              sx={{
                p: 2,
                border: winningTeamId === game.team2.id ? '2px solid #1976d2' : '1px solid #e0e0e0',
                borderRadius: 1,
                cursor: 'pointer',
                '&:hover': { backgroundColor: '#f5f5f5' },
              }}
              onClick={() => setWinningTeamId(game.team2.id)}
            >
              <FormControlLabel
                value={game.team2.id}
                control={<Radio />}
                label={
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {game.team2.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {game.team2.player1} & {game.team2.player2}
                    </Typography>
                  </Box>
                }
              />
            </Box>
          </Box>
        </RadioGroup>
      </FormControl>

      <TextField
        fullWidth
        type="number"
        label="Score"
        placeholder="Enter winning team's score"
        value={score}
        onChange={(e) => setScore(e.target.value)}
        disabled={loading}
        inputProps={{ min: 0 }}
        sx={{ mb: 2 }}
      />

      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={loading || !winningTeamId || !score}
          fullWidth
        >
          {loading ? 'Submitting...' : 'Submit Result'}
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

export default ResultEntryForm;

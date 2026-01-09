import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
} from '@mui/material';
import { getCurrentGames } from '../../api/games';
import { Game } from '../../types/game';
import GameCard from './GameCard';

interface CurrentGamesListProps {
  refreshTrigger?: number;
  onResultSubmitted: () => void;
}

const CurrentGamesList: React.FC<CurrentGamesListProps> = ({ refreshTrigger, onResultSubmitted }) => {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

  const loadGames = async () => {
    setLoading(true);
    try {
      const currentGames = await getCurrentGames();
      setGames(currentGames);
    } catch (err) {
      console.error('Failed to load current games:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGames();
  }, [refreshTrigger]);

  if (loading) {
    return (
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography>🐔 Chargement des parties en cours...</Typography>
      </Paper>
    );
  }

  if (games.length === 0) {
    return (
      <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>
          🎮 Parties en Cours
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Aucune partie en cours. Générez une nouvelle partie pour commencer!
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        🎮 Parties en Cours ({games.length})
      </Typography>

      <Grid container spacing={2}>
        {games.map((game) => (
          <Grid item xs={12} md={6} key={game.id}>
            <GameCard game={game} onResultSubmitted={onResultSubmitted} />
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
};

export default CurrentGamesList;

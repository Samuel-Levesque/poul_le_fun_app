import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Alert,
  Paper,
  Card,
  CardContent,
  Chip,
} from '@mui/material';
import { generateGame, getAvailableTeams } from '../../api/games';
import { Game } from '../../types/game';
import { Team } from '../../types/team';
import GameEditor from './GameEditor';

interface GameGeneratorProps {
  onGameCreated: () => void;
}

const GameGenerator: React.FC<GameGeneratorProps> = ({ onGameCreated }) => {
  const [generatedGame, setGeneratedGame] = useState<Game | null>(null);
  const [availableTeams, setAvailableTeams] = useState<Team[]>([]);
  const [showManualEditor, setShowManualEditor] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const loadAvailableTeams = async () => {
    try {
      const teams = await getAvailableTeams();
      setAvailableTeams(teams);
    } catch (err) {
      console.error('Failed to load available teams:', err);
    }
  };

  useEffect(() => {
    loadAvailableTeams();
  }, []);

  const handleGenerateGame = async () => {
    setError('');
    setLoading(true);
    setGeneratedGame(null);

    try {
      const game = await generateGame();
      setGeneratedGame(game);
      onGameCreated();
      await loadAvailableTeams();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to generate game');
    } finally {
      setLoading(false);
    }
  };

  const handleManualCreation = () => {
    setShowManualEditor(true);
    setGeneratedGame(null);
  };

  const handleManualGameCreated = () => {
    setShowManualEditor(false);
    onGameCreated();
    loadAvailableTeams();
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h5" gutterBottom>
        🎮 Générer la Prochaine Partie
      </Typography>

      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Poulaillers disponibles (pas en train de jouer): {availableTeams.length}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {generatedGame && (
        <Card sx={{ mb: 2, backgroundColor: '#e3f2fd' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              ✨ Partie Générée
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Chip
                label={`${generatedGame.team1.name}: ${generatedGame.team1.player1} & ${generatedGame.team1.player2}`}
                color="primary"
              />
              <Typography variant="h6">vs</Typography>
              <Chip
                label={`${generatedGame.team2.name}: ${generatedGame.team2.player1} & ${generatedGame.team2.player2}`}
                color="secondary"
              />
            </Box>
          </CardContent>
        </Card>
      )}

      {showManualEditor ? (
        <Box>
          <GameEditor
            availableTeams={availableTeams}
            onGameCreated={handleManualGameCreated}
            onCancel={() => setShowManualEditor(false)}
          />
        </Box>
      ) : (
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleGenerateGame}
            disabled={loading || availableTeams.length < 2}
            fullWidth
          >
            {loading ? '🥚 Génération...' : '🎮 Générer Prochaine Partie'}
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            onClick={handleManualCreation}
            disabled={availableTeams.length < 2}
            fullWidth
          >
            ✋ Sélection Manuelle
          </Button>
        </Box>
      )}
    </Paper>
  );
};

export default GameGenerator;

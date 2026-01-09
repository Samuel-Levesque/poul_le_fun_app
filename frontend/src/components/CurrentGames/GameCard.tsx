import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
} from '@mui/material';
import { Game } from '../../types/game';
import ResultEntryForm from '../Results/ResultEntryForm';

interface GameCardProps {
  game: Game;
  onResultSubmitted: () => void;
}

const GameCard: React.FC<GameCardProps> = ({ game, onResultSubmitted }) => {
  const [showResultForm, setShowResultForm] = useState(false);

  const handleResultSubmitted = () => {
    setShowResultForm(false);
    onResultSubmitted();
  };

  return (
    <>
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Partie #{game.id}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box>
              <Chip
                label={game.team1.name}
                color="primary"
                size="small"
                sx={{ mb: 0.5 }}
              />
              <Typography variant="body1" fontWeight="bold">
                {game.team1.player1} & {game.team1.player2}
              </Typography>
            </Box>

            <Typography variant="h6" align="center" color="text.secondary">
              VS
            </Typography>

            <Box>
              <Chip
                label={game.team2.name}
                color="secondary"
                size="small"
                sx={{ mb: 0.5 }}
              />
              <Typography variant="body1" fontWeight="bold">
                {game.team2.player1} & {game.team2.player2}
              </Typography>
            </Box>
          </Box>

          <Button
            variant="contained"
            color="success"
            fullWidth
            sx={{ mt: 2 }}
            onClick={() => setShowResultForm(true)}
          >
            🏆 Entrer le Résultat
          </Button>
        </CardContent>
      </Card>

      <Dialog
        open={showResultForm}
        onClose={() => setShowResultForm(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>🏆 Entrer le Résultat de la Partie</DialogTitle>
        <DialogContent>
          <ResultEntryForm
            game={game}
            onResultSubmitted={handleResultSubmitted}
            onCancel={() => setShowResultForm(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default GameCard;

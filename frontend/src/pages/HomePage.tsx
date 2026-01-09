import React from 'react';
import { Box, Typography, Paper, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box>
      <Paper elevation={3} sx={{ p: 4, mb: 3, textAlign: 'center' }}>
        <Typography variant="h3" gutterBottom>
          Poul Le Fun Tournament
        </Typography>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Card Tournament Management System
        </Typography>
      </Paper>

      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Getting Started
        </Typography>
        <Typography variant="body1" paragraph>
          Welcome to the Poul Le Fun tournament management app! Here's how to run your tournament:
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 3 }}>
          <Box>
            <Typography variant="h6">1. Create Teams</Typography>
            <Typography variant="body2" color="text.secondary">
              Enter player names to automatically generate random team pairings.
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/teams')}
              sx={{ mt: 1 }}
            >
              Go to Teams
            </Button>
          </Box>

          <Box>
            <Typography variant="h6">2. Generate Games</Typography>
            <Typography variant="body2" color="text.secondary">
              Generate fair matchups ensuring all teams play equally and no duplicate games.
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/games')}
              sx={{ mt: 1 }}
            >
              Go to Games
            </Button>
          </Box>

          <Box>
            <Typography variant="h6">3. View Rankings</Typography>
            <Typography variant="body2" color="text.secondary">
              Track scores, wins, losses, and overall standings.
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/rankings')}
              sx={{ mt: 1 }}
            >
              Go to Rankings
            </Button>
          </Box>

          <Box>
            <Typography variant="h6">4. Match Matrix</Typography>
            <Typography variant="body2" color="text.secondary">
              Visual overview of all matchups played and remaining.
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/matrix')}
              sx={{ mt: 1 }}
            >
              Go to Matrix
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default HomePage;

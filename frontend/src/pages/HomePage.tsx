import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Alert,
  Snackbar,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { clearDatabase } from '../api/admin';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string }>({
    open: false,
    message: '',
  });

  const handleClearDatabase = async () => {
    setClearing(true);
    setError('');

    try {
      const result = await clearDatabase();
      setClearDialogOpen(false);
      setSnackbar({
        open: true,
        message: `Database cleared! Deleted ${result.deleted.teams} teams, ${result.deleted.games} games, and ${result.deleted.results} results.`,
      });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to clear database');
    } finally {
      setClearing(false);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

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

      <Paper
        elevation={3}
        sx={{
          p: 3,
          mt: 3,
          backgroundColor: '#fff3e0',
          border: '2px solid #ff9800',
        }}
      >
        <Typography variant="h5" gutterBottom color="error">
          Administration
        </Typography>
        <Typography variant="body1" paragraph>
          Danger zone: Use these options with caution.
        </Typography>
        <Button
          variant="contained"
          color="error"
          onClick={() => setClearDialogOpen(true)}
        >
          Clear All Data
        </Button>
      </Paper>

      <Dialog open={clearDialogOpen} onClose={() => setClearDialogOpen(false)}>
        <DialogTitle>Clear All Data?</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <DialogContentText>
            Are you sure you want to clear the entire database?
            <br />
            <br />
            <strong>This will permanently delete:</strong>
            <ul>
              <li>All teams</li>
              <li>All games</li>
              <li>All results</li>
            </ul>
            <br />
            <strong>This action cannot be undone!</strong>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setClearDialogOpen(false)} disabled={clearing}>
            Cancel
          </Button>
          <Button
            onClick={handleClearDatabase}
            color="error"
            variant="contained"
            disabled={clearing}
          >
            {clearing ? 'Clearing...' : 'Yes, Clear Everything'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default HomePage;

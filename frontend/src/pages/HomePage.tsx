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
import { useLanguage } from '../i18n/LanguageContext';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
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
        message: t('home.admin.successMessage', {
          teams: result.deleted.teams.toString(),
          games: result.deleted.games.toString(),
          results: result.deleted.results.toString(),
        }),
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
      <Paper elevation={3} sx={{
        p: 4,
        mb: 3,
        textAlign: 'center',
        background: 'linear-gradient(135deg, #00E5FF 0%, #FF4081 50%, #FFD700 100%)',
      }}>
        <Typography variant="h3" gutterBottom sx={{ color: '#212121', textShadow: '3px 3px 0px rgba(255,255,255,0.5)' }}>
          {t('home.title')}
        </Typography>
        <Typography variant="h6" gutterBottom sx={{ color: '#212121', fontWeight: 'bold' }}>
          {t('home.subtitle')}
        </Typography>
        <Typography variant="body1" sx={{ color: '#212121', fontStyle: 'italic', mt: 1 }}>
          {t('home.tagline')}
        </Typography>
      </Paper>

      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          {t('home.howToPlay')}
        </Typography>
        <Typography variant="body1" paragraph>
          {t('home.welcome')}
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 3 }}>
          <Box>
            <Typography variant="h6">{t('home.step1.title')}</Typography>
            <Typography variant="body2" color="text.secondary">
              {t('home.step1.description')}
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/teams')}
              sx={{ mt: 1 }}
            >
              {t('home.step1.button')}
            </Button>
          </Box>

          <Box>
            <Typography variant="h6">{t('home.step2.title')}</Typography>
            <Typography variant="body2" color="text.secondary">
              {t('home.step2.description')}
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/games')}
              sx={{ mt: 1 }}
            >
              {t('home.step2.button')}
            </Button>
          </Box>

          <Box>
            <Typography variant="h6">{t('home.step3.title')}</Typography>
            <Typography variant="body2" color="text.secondary">
              {t('home.step3.description')}
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/rankings')}
              sx={{ mt: 1 }}
            >
              {t('home.step3.button')}
            </Button>
          </Box>

          <Box>
            <Typography variant="h6">{t('home.step4.title')}</Typography>
            <Typography variant="body2" color="text.secondary">
              {t('home.step4.description')}
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/matrix')}
              sx={{ mt: 1 }}
            >
              {t('home.step4.button')}
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
          border: '4px solid #ff9800',
        }}
      >
        <Typography variant="h5" gutterBottom color="error">
          {t('home.admin.title')}
        </Typography>
        <Typography variant="body1" paragraph>
          {t('home.admin.warning')}
        </Typography>
        <Button
          variant="contained"
          color="error"
          onClick={() => setClearDialogOpen(true)}
        >
          {t('home.admin.clearButton')}
        </Button>
      </Paper>

      <Dialog open={clearDialogOpen} onClose={() => setClearDialogOpen(false)}>
        <DialogTitle>{t('home.admin.dialogTitle')}</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <DialogContentText>
            {t('home.admin.dialogContent')}
            <br />
            <br />
            <strong>{t('home.admin.dialogWarning')}</strong>
            <ul>
              <li>{t('home.admin.deleteTeams')}</li>
              <li>{t('home.admin.deleteGames')}</li>
              <li>{t('home.admin.deleteResults')}</li>
            </ul>
            <br />
            <strong>{t('home.admin.cannotUndo')}</strong>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setClearDialogOpen(false)} disabled={clearing}>
            {t('home.admin.cancel')}
          </Button>
          <Button
            onClick={handleClearDatabase}
            color="error"
            variant="contained"
            disabled={clearing}
          >
            {clearing ? t('home.admin.clearing') : t('home.admin.confirm')}
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

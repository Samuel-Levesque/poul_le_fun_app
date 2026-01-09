import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  Button,
  CssBaseline,
} from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import HomePage from './pages/HomePage';
import TeamsPage from './pages/TeamsPage';
import GamesPage from './pages/GamesPage';
import RankingsPage from './pages/RankingsPage';
import MatrixPage from './pages/MatrixPage';
import { retroTheme } from './theme/retroTheme';
import { LanguageProvider, useLanguage } from './i18n/LanguageContext';

const AppContent: React.FC = () => {
  const { t } = useLanguage();

  return (
    <Router>
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <AppBar position="static" sx={{
          background: 'linear-gradient(135deg, #00E5FF 0%, #FF4081 50%, #FFD700 100%)',
          boxShadow: '0 4px 0px rgba(0,0,0,0.3)',
        }}>
          <Toolbar>
            <Typography variant="h6" component="div" sx={{
              flexGrow: 1,
              fontFamily: '"Press Start 2P", cursive',
              fontSize: '1rem',
              color: '#212121',
              textShadow: '2px 2px 0px rgba(255,255,255,0.5)',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}>
              {t('appTitle')}
            </Typography>
            <Button color="inherit" component={Link} to="/" sx={{ color: '#212121', fontWeight: 'bold' }}>
              {t('nav.home')}
            </Button>
            <Button color="inherit" component={Link} to="/teams" sx={{ color: '#212121', fontWeight: 'bold' }}>
              {t('nav.coops')}
            </Button>
            <Button color="inherit" component={Link} to="/games" sx={{ color: '#212121', fontWeight: 'bold' }}>
              {t('nav.games')}
            </Button>
            <Button color="inherit" component={Link} to="/rankings" sx={{ color: '#212121', fontWeight: 'bold' }}>
              {t('nav.rankings')}
            </Button>
            <Button color="inherit" component={Link} to="/matrix" sx={{ color: '#212121', fontWeight: 'bold' }}>
              {t('nav.matrix')}
            </Button>
          </Toolbar>
        </AppBar>

          <Container maxWidth="lg" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/teams" element={<TeamsPage />} />
              <Route path="/games" element={<GamesPage />} />
              <Route path="/rankings" element={<RankingsPage />} />
              <Route path="/matrix" element={<MatrixPage />} />
            </Routes>
          </Container>

        <Box
          component="footer"
          sx={{
            py: 3,
            px: 2,
            mt: 'auto',
            background: 'linear-gradient(135deg, #FFD700 0%, #FF4081 50%, #00E5FF 100%)',
            textAlign: 'center',
            borderTop: '4px solid #212121',
          }}
        >
          <Typography variant="body2" sx={{
            fontFamily: '"Press Start 2P", cursive',
            fontSize: '0.6rem',
            color: '#212121',
            textShadow: '1px 1px 0px rgba(255,255,255,0.5)',
          }}>
            {t('footer.tagline')}
          </Typography>
          <Typography variant="body2" sx={{
            fontSize: '0.7rem',
            color: '#212121',
            mt: 1,
          }}>
            {t('footer.copyright')}
          </Typography>
        </Box>
      </Box>
    </Router>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider theme={retroTheme}>
      <CssBaseline />
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </ThemeProvider>
  );
};

export default App;

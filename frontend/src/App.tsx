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
import { ThemeProvider, createTheme } from '@mui/material/styles';
import HomePage from './pages/HomePage';
import TeamsPage from './pages/TeamsPage';
import GamesPage from './pages/GamesPage';
import RankingsPage from './pages/RankingsPage';
import MatrixPage from './pages/MatrixPage';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <AppBar position="static">
            <Toolbar>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                Poul Le Fun Tournament
              </Typography>
              <Button color="inherit" component={Link} to="/">
                Home
              </Button>
              <Button color="inherit" component={Link} to="/teams">
                Teams
              </Button>
              <Button color="inherit" component={Link} to="/games">
                Games
              </Button>
              <Button color="inherit" component={Link} to="/rankings">
                Rankings
              </Button>
              <Button color="inherit" component={Link} to="/matrix">
                Matrix
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
              backgroundColor: '#f5f5f5',
              textAlign: 'center',
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Poul Le Fun Tournament © 2026
            </Typography>
          </Box>
        </Box>
      </Router>
    </ThemeProvider>
  );
};

export default App;

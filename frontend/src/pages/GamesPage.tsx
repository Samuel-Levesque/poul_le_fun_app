import React, { useState } from 'react';
import { Box, Grid } from '@mui/material';
import GameGenerator from '../components/GameGeneration/GameGenerator';
import CurrentGamesList from '../components/CurrentGames/CurrentGamesList';

const GamesPage: React.FC = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleGameChange = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <GameGenerator onGameCreated={handleGameChange} />
        </Grid>
        <Grid item xs={12}>
          <CurrentGamesList
            refreshTrigger={refreshTrigger}
            onResultSubmitted={handleGameChange}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default GamesPage;

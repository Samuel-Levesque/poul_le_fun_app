import React, { useState } from 'react';
import { Box, Button } from '@mui/material';
import RankingsTable from '../components/Rankings/RankingsTable';

const RankingsPage: React.FC = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <Box>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="outlined"
          onClick={handleRefresh}
        >
          Refresh Rankings
        </Button>
      </Box>
      <RankingsTable refreshTrigger={refreshTrigger} />
    </Box>
  );
};

export default RankingsPage;

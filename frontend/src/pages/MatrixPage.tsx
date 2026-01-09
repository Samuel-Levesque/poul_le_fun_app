import React, { useState } from 'react';
import { Box, Button } from '@mui/material';
import MatchMatrix from '../components/MatchMatrix/MatchMatrix';

const MatrixPage: React.FC = () => {
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
          🔄 Rafraîchir la Matrice
        </Button>
      </Box>
      <MatchMatrix refreshTrigger={refreshTrigger} />
    </Box>
  );
};

export default MatrixPage;

import React from 'react';
import {
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Chip,
  Box,
} from '@mui/material';
import { Team } from '../../types/team';

interface TeamListProps {
  teams: Team[];
}

const TeamList: React.FC<TeamListProps> = ({ teams }) => {
  if (teams.length === 0) {
    return (
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="body1" color="text.secondary">
          No teams created yet. Create teams to get started!
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Teams ({teams.length})
      </Typography>

      <List>
        {teams.map((team) => (
          <ListItem
            key={team.id}
            sx={{
              border: '1px solid #e0e0e0',
              borderRadius: 1,
              mb: 1,
              '&:hover': {
                backgroundColor: '#f5f5f5',
              },
            }}
          >
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip label={team.name} color="primary" size="small" />
                  <Typography variant="body1" fontWeight="bold">
                    {team.player1} & {team.player2}
                  </Typography>
                </Box>
              }
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default TeamList;

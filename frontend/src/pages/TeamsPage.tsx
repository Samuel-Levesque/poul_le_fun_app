import React, { useState, useEffect } from 'react';
import { Box, Snackbar, Alert } from '@mui/material';
import NameBankCreation from '../components/TeamCreation/NameBankCreation';
import ManualTeamCreation from '../components/TeamCreation/ManualTeamCreation';
import TeamList from '../components/TeamCreation/TeamList';
import { getTeams } from '../api/teams';
import { Team } from '../types/team';

const TeamsPage: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const loadTeams = async () => {
    try {
      const fetchedTeams = await getTeams();
      setTeams(fetchedTeams);
    } catch (err) {
      console.error('Failed to load teams:', err);
    }
  };

  useEffect(() => {
    loadTeams();
  }, []);

  const handleTeamsCreated = (newTeams: Team[]) => {
    setTeams([...teams, ...newTeams]);
  };

  const handleTeamCreated = (team: Team) => {
    setTeams([...teams, team]);
  };

  const handleTeamDeleted = (teamId: number) => {
    setTeams(teams.filter(team => team.id !== teamId));
    setSnackbar({
      open: true,
      message: 'Team deleted successfully',
      severity: 'success',
    });
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box>
      <NameBankCreation onTeamsCreated={handleTeamsCreated} />
      <ManualTeamCreation onTeamCreated={handleTeamCreated} />
      <TeamList teams={teams} onTeamDeleted={handleTeamDeleted} />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TeamsPage;

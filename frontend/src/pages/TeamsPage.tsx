import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import TeamCreationForm from '../components/TeamCreation/TeamCreationForm';
import TeamList from '../components/TeamCreation/TeamList';
import { getTeams } from '../api/teams';
import { Team } from '../types/team';

const TeamsPage: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);

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

  return (
    <Box>
      <TeamCreationForm onTeamsCreated={handleTeamsCreated} />
      <TeamList teams={teams} />
    </Box>
  );
};

export default TeamsPage;

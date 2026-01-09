import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Box,
  Chip,
} from '@mui/material';
import { getMatchMatrix } from '../../api/results';
import { Team } from '../../types/team';

interface MatchMatrixProps {
  refreshTrigger?: number;
}

const MatchMatrix: React.FC<MatchMatrixProps> = ({ refreshTrigger }) => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [matrix, setMatrix] = useState<any>({});
  const [loading, setLoading] = useState(true);

  const loadMatrix = async () => {
    setLoading(true);
    try {
      const data = await getMatchMatrix();
      setTeams(data.teams);
      setMatrix(data.matrix);
    } catch (err) {
      console.error('Failed to load match matrix:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMatrix();
  }, [refreshTrigger]);

  const getCellColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#c8e6c9'; // green
      case 'in_progress':
        return '#fff9c4'; // yellow
      case 'unplayed':
        return '#f5f5f5'; // gray
      default:
        return '#ffffff';
    }
  };

  const getCellText = (status: string, gameId?: number) => {
    switch (status) {
      case 'completed':
        return '✓';
      case 'in_progress':
        return '▶';
      case 'unplayed':
        return '-';
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography>Loading match matrix...</Typography>
      </Paper>
    );
  }

  if (teams.length === 0) {
    return (
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Match Matrix
        </Typography>
        <Typography variant="body1" color="text.secondary">
          No teams yet. Create teams to see the match matrix!
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Match Matrix
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        ✓ = Completed | ▶ = In Progress | - = Not Played
      </Typography>

      <Box sx={{ overflowX: 'auto', mt: 3 }}>
        <table style={{ borderCollapse: 'collapse', width: '100%' }}>
          <thead>
            <tr>
              <th style={{ padding: '8px', border: '1px solid #e0e0e0', backgroundColor: '#f5f5f5' }}>
                Team
              </th>
              {teams.map((team) => (
                <th
                  key={team.id}
                  style={{
                    padding: '8px',
                    border: '1px solid #e0e0e0',
                    backgroundColor: '#f5f5f5',
                    minWidth: '80px',
                  }}
                >
                  <Chip label={team.name} size="small" color="primary" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {teams.map((team1) => (
              <tr key={team1.id}>
                <td style={{ padding: '8px', border: '1px solid #e0e0e0', backgroundColor: '#f5f5f5' }}>
                  <Chip label={team1.name} size="small" color="primary" />
                </td>
                {teams.map((team2) => {
                  const cellData = matrix[team1.id]?.[team2.id];
                  const isNull = cellData === null;
                  const status = cellData?.status || 'unplayed';

                  return (
                    <td
                      key={team2.id}
                      style={{
                        padding: '8px',
                        border: '1px solid #e0e0e0',
                        backgroundColor: isNull ? '#e0e0e0' : getCellColor(status),
                        textAlign: 'center',
                        fontWeight: 'bold',
                      }}
                    >
                      {isNull ? '' : getCellText(status, cellData?.game_id)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </Box>
    </Paper>
  );
};

export default MatchMatrix;

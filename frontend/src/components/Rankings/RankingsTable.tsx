import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Box,
} from '@mui/material';
import { getRankings } from '../../api/results';
import { Ranking } from '../../types/result';

interface RankingsTableProps {
  refreshTrigger?: number;
}

const RankingsTable: React.FC<RankingsTableProps> = ({ refreshTrigger }) => {
  const [rankings, setRankings] = useState<Ranking[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRankings = async () => {
    setLoading(true);
    try {
      const data = await getRankings();
      setRankings(data);
    } catch (err) {
      console.error('Failed to load rankings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRankings();
  }, [refreshTrigger]);

  if (loading) {
    return (
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography>🐔 Chargement du classement...</Typography>
      </Paper>
    );
  }

  if (rankings.length === 0) {
    return (
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          🏆 Classement
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Aucun classement pour l'instant. Jouez quelques parties pour voir le tableau des scores!
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        🏆 Classement
      </Typography>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell><strong>Rang</strong></TableCell>
              <TableCell><strong>Poulailler</strong></TableCell>
              <TableCell><strong>Joueurs</strong></TableCell>
              <TableCell align="center"><strong>Score</strong></TableCell>
              <TableCell align="center"><strong>Parties</strong></TableCell>
              <TableCell align="center"><strong>Gagnées</strong></TableCell>
              <TableCell align="center"><strong>Perdues</strong></TableCell>
              <TableCell align="center"><strong>% Victoire</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rankings.map((ranking) => (
              <TableRow
                key={ranking.team_id}
                sx={{
                  backgroundColor: ranking.rank === 1 ? '#fff9c4' :
                                 ranking.rank === 2 ? '#e0e0e0' :
                                 ranking.rank === 3 ? '#ffccbc' : 'inherit',
                  '&:hover': { backgroundColor: '#f5f5f5' },
                }}
              >
                <TableCell>
                  {ranking.rank === 1 && '🥇'}
                  {ranking.rank === 2 && '🥈'}
                  {ranking.rank === 3 && '🥉'}
                  {ranking.rank > 3 && ranking.rank}
                </TableCell>
                <TableCell>
                  <Chip label={ranking.team_name} size="small" color="primary" />
                </TableCell>
                <TableCell>
                  {ranking.players[0]} & {ranking.players[1]}
                </TableCell>
                <TableCell align="center">
                  <Typography variant="h6" color="primary">
                    {ranking.total_score}
                  </Typography>
                </TableCell>
                <TableCell align="center">{ranking.games_played}</TableCell>
                <TableCell align="center">
                  <Chip label={ranking.games_won} size="small" color="success" />
                </TableCell>
                <TableCell align="center">
                  <Chip label={ranking.games_lost} size="small" color="error" />
                </TableCell>
                <TableCell align="center">
                  {(ranking.win_rate * 100).toFixed(0)}%
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default RankingsTable;

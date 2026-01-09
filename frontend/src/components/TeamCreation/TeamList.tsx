import React, { useState } from 'react';
import {
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Chip,
  Box,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Alert,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { Team } from '../../types/team';
import { deleteTeam } from '../../api/teams';
import { useLanguage } from '../../i18n/LanguageContext';

interface TeamListProps {
  teams: Team[];
  onTeamDeleted: (teamId: number) => void;
}

const TeamList: React.FC<TeamListProps> = ({ teams, onTeamDeleted }) => {
  const { t } = useLanguage();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [teamToDelete, setTeamToDelete] = useState<Team | null>(null);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);

  const handleDeleteClick = (team: Team) => {
    setTeamToDelete(team);
    setDeleteDialogOpen(true);
    setError('');
  };

  const handleDeleteConfirm = async () => {
    if (!teamToDelete) return;

    setDeleting(true);
    setError('');

    try {
      await deleteTeam(teamToDelete.id);
      onTeamDeleted(teamToDelete.id);
      setDeleteDialogOpen(false);
      setTeamToDelete(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete team');
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setTeamToDelete(null);
    setError('');
  };

  if (teams.length === 0) {
    return (
      <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          {t('teamList.emptyTitle')}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {t('teamList.emptyMessage')}
        </Typography>
      </Paper>
    );
  }

  return (
    <>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          {t('teamList.title', { count: teams.length })}
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
              secondaryAction={
                <IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={() => handleDeleteClick(team)}
                  color="error"
                >
                  <DeleteIcon />
                </IconButton>
              }
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

      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>{t('teamList.deleteDialog.title')}</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <DialogContentText>
            {t('teamList.deleteDialog.message', { teamName: teamToDelete?.name || '' })}
            <br />
            ({teamToDelete?.player1} & {teamToDelete?.player2})
            <br />
            <br />
            {t('teamList.deleteDialog.warning')}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} disabled={deleting}>
            {t('teamList.deleteDialog.cancel')}
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={deleting}
          >
            {deleting ? t('teamList.deleteDialog.deleting') : t('teamList.deleteDialog.confirm')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default TeamList;

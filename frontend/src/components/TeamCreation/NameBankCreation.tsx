import React, { useState, useRef } from 'react';
import {
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Chip,
  Alert,
} from '@mui/material';
import { createTeams } from '../../api/teams';
import { Team } from '../../types/team';
import TeamGenerationAnimation from './TeamGenerationAnimation';
import { useLanguage } from '../../i18n/LanguageContext';

interface NameBankCreationProps {
  onTeamsCreated: (teams: Team[]) => void;
}

const NameBankCreation: React.FC<NameBankCreationProps> = ({ onTeamsCreated }) => {
  const { t } = useLanguage();
  const [names, setNames] = useState<string[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [error, setError] = useState('');
  const [generating, setGenerating] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);
  const [generatedTeams, setGeneratedTeams] = useState<Team[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleAddName = () => {
    const trimmedName = currentInput.trim();

    if (!trimmedName) {
      setError(t('nameBank.errors.enterName'));
      return;
    }

    if (names.includes(trimmedName)) {
      setError(t('nameBank.errors.duplicate'));
      return;
    }

    setNames([...names, trimmedName]);
    setCurrentInput('');
    setError('');

    // Return focus to input
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  const handleRemoveName = (nameToRemove: string) => {
    setNames(names.filter(name => name !== nameToRemove));
    setError('');
  };

  const handleClearAll = () => {
    setNames([]);
    setCurrentInput('');
    setError('');
  };

  const handleGenerateTeams = async () => {
    // Validation
    if (names.length < 2) {
      setError(t('nameBank.errors.minPlayers'));
      return;
    }

    if (names.length % 2 !== 0) {
      setError(t('nameBank.errors.evenPlayers'));
      return;
    }

    setGenerating(true);
    setShowAnimation(true);
    setError('');

    try {
      // Let animation spin for visual effect
      await new Promise(resolve => setTimeout(resolve, 2500));

      // Make API call
      const teams = await createTeams(names);
      setGeneratedTeams(teams);

      // Continue animation to reveal teams
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Close animation and notify parent
      setShowAnimation(false);
      onTeamsCreated(teams);
      setNames([]);
      setCurrentInput('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to generate teams');
      setShowAnimation(false);
    } finally {
      setGenerating(false);
    }
  };

  const isValidForGeneration = names.length >= 2 && names.length % 2 === 0;
  const playerCountColor = names.length === 0 ? 'text.secondary' :
                          names.length % 2 === 0 ? 'success.main' : 'warning.main';

  return (
    <>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {t('nameBank.title')}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {t('nameBank.subtitle')}
        </Typography>

        {/* Input Row */}
        <Box sx={{ display: 'flex', gap: 2, mt: 2, mb: 2 }}>
          <TextField
            fullWidth
            inputRef={inputRef}
            label={t('nameBank.chickNameLabel')}
            placeholder={t('nameBank.placeholder')}
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddName();
              }
            }}
            disabled={generating}
            autoFocus
          />
          <Button
            variant="contained"
            onClick={handleAddName}
            disabled={generating || !currentInput.trim()}
            sx={{ minWidth: 120 }}
          >
            {t('nameBank.addButton')}
          </Button>
        </Box>

        {/* Error Display */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Player Count */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="body1" sx={{ color: playerCountColor, fontWeight: 'medium' }}>
            {t('nameBank.chicksReady', { count: names.length })}
            {names.length > 0 && names.length % 2 === 0 && t('nameBank.evenNumber')}
            {names.length > 0 && names.length % 2 !== 0 && t('nameBank.oddNumber')}
          </Typography>
        </Box>

        {/* Name Bank Display */}
        {names.length === 0 ? (
          <Box sx={{
            p: 3,
            textAlign: 'center',
            backgroundColor: '#f5f5f5',
            borderRadius: 1,
            mb: 2
          }}>
            <Typography variant="body2" color="text.secondary">
              {t('nameBank.emptyState')}
            </Typography>
          </Box>
        ) : (
          <Box sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 1,
            mb: 2,
            p: 2,
            backgroundColor: '#f5f5f5',
            borderRadius: 1,
            minHeight: 60
          }}>
            {names.map((name, index) => (
              <Chip
                key={index}
                label={name}
                onDelete={() => handleRemoveName(name)}
                color={index % 3 === 0 ? 'primary' : index % 3 === 1 ? 'secondary' : 'default'}
                sx={{ fontSize: '0.95rem' }}
              />
            ))}
          </Box>
        )}

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'space-between' }}>
          <Button
            variant="outlined"
            onClick={handleClearAll}
            disabled={generating || names.length === 0}
          >
            {t('nameBank.clearButton')}
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleGenerateTeams}
            disabled={generating || !isValidForGeneration}
            size="large"
            sx={{ minWidth: 200 }}
          >
            {generating ? t('nameBank.hatching') : t('nameBank.hatchButton')}
          </Button>
        </Box>
      </Paper>

      {/* Animation Modal */}
      <TeamGenerationAnimation
        open={showAnimation}
        names={names}
        teams={generatedTeams}
      />
    </>
  );
};

export default NameBankCreation;

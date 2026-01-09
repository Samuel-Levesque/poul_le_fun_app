import React from 'react';
import { Button, Box } from '@mui/material';
import { useLanguage } from '../i18n/LanguageContext';

const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
      <Button
        variant={language === 'fr' ? 'contained' : 'outlined'}
        size="small"
        onClick={() => setLanguage('fr')}
        sx={{
          minWidth: '50px',
          fontWeight: 'bold',
          fontSize: '0.8rem',
          color: language === 'fr' ? '#212121' : '#212121',
          borderColor: '#212121',
          backgroundColor: language === 'fr' ? '#FFD700' : 'transparent',
          '&:hover': {
            backgroundColor: language === 'fr' ? '#FFC107' : 'rgba(255, 215, 0, 0.1)',
            borderColor: '#212121',
          },
        }}
      >
        🇫🇷 FR
      </Button>
      <Button
        variant={language === 'en' ? 'contained' : 'outlined'}
        size="small"
        onClick={() => setLanguage('en')}
        sx={{
          minWidth: '50px',
          fontWeight: 'bold',
          fontSize: '0.8rem',
          color: language === 'en' ? '#212121' : '#212121',
          borderColor: '#212121',
          backgroundColor: language === 'en' ? '#FFD700' : 'transparent',
          '&:hover': {
            backgroundColor: language === 'en' ? '#FFC107' : 'rgba(255, 215, 0, 0.1)',
            borderColor: '#212121',
          },
        }}
      >
        🇬🇧 EN
      </Button>
    </Box>
  );
};

export default LanguageSwitcher;

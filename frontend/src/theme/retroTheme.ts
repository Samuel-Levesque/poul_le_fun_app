import { createTheme } from '@mui/material/styles';
import retroColors from './colors';

// Custom retro gaming theme for Poul Le Fun
export const retroTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: retroColors.retroCyan,
      light: retroColors.retroCyanLight,
      dark: retroColors.retroCyan,
      contrastText: retroColors.pixelBlack,
    },
    secondary: {
      main: retroColors.bubblegumPink,
      light: retroColors.bubblegumPinkLight,
      dark: retroColors.bubblegumPink,
      contrastText: retroColors.pixelWhite,
    },
    error: {
      main: retroColors.heartRed,
      light: retroColors.heartRedLight,
    },
    warning: {
      main: retroColors.orangeBlast,
      light: retroColors.orangeBlastDark,
    },
    success: {
      main: retroColors.grassGreen,
      dark: retroColors.grassGreenDark,
    },
    info: {
      main: retroColors.purplePower,
      dark: retroColors.purplePowerDark,
    },
    background: {
      default: retroColors.barnyard,
      paper: retroColors.pixelWhite,
    },
    text: {
      primary: retroColors.pixelBlack,
      secondary: '#666666',
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
    h1: {
      fontFamily: '"Press Start 2P", cursive',
      fontSize: '2.5rem',
      fontWeight: 400,
      letterSpacing: '0.05em',
      lineHeight: 1.6,
    },
    h2: {
      fontFamily: '"Press Start 2P", cursive',
      fontSize: '2rem',
      fontWeight: 400,
      letterSpacing: '0.05em',
      lineHeight: 1.6,
    },
    h3: {
      fontFamily: '"Press Start 2P", cursive',
      fontSize: '1.5rem',
      fontWeight: 400,
      letterSpacing: '0.05em',
      lineHeight: 1.6,
    },
    h4: {
      fontFamily: '"Press Start 2P", cursive',
      fontSize: '1.2rem',
      fontWeight: 400,
      letterSpacing: '0.05em',
      lineHeight: 1.6,
    },
    h5: {
      fontFamily: '"Press Start 2P", cursive',
      fontSize: '1rem',
      fontWeight: 400,
      letterSpacing: '0.05em',
      lineHeight: 1.6,
    },
    h6: {
      fontFamily: '"Press Start 2P", cursive',
      fontSize: '0.875rem',
      fontWeight: 400,
      letterSpacing: '0.05em',
      lineHeight: 1.6,
    },
    button: {
      fontFamily: '"Press Start 2P", cursive',
      fontSize: '0.75rem',
      letterSpacing: '0.05em',
      textTransform: 'uppercase',
    },
  },
  shape: {
    borderRadius: 4,
  },
  shadows: [
    'none',
    '4px 4px 0px rgba(0, 0, 0, 0.25)', // Retro offset shadow
    '4px 4px 0px rgba(0, 0, 0, 0.25)',
    '6px 6px 0px rgba(0, 0, 0, 0.25)',
    '6px 6px 0px rgba(0, 0, 0, 0.25)',
    '8px 8px 0px rgba(0, 0, 0, 0.25)',
    '8px 8px 0px rgba(0, 0, 0, 0.25)',
    '10px 10px 0px rgba(0, 0, 0, 0.25)',
    '10px 10px 0px rgba(0, 0, 0, 0.25)',
    '12px 12px 0px rgba(0, 0, 0, 0.25)',
    '12px 12px 0px rgba(0, 0, 0, 0.25)',
    '14px 14px 0px rgba(0, 0, 0, 0.25)',
    '14px 14px 0px rgba(0, 0, 0, 0.25)',
    '16px 16px 0px rgba(0, 0, 0, 0.25)',
    '16px 16px 0px rgba(0, 0, 0, 0.25)',
    '18px 18px 0px rgba(0, 0, 0, 0.25)',
    '18px 18px 0px rgba(0, 0, 0, 0.25)',
    '20px 20px 0px rgba(0, 0, 0, 0.25)',
    '20px 20px 0px rgba(0, 0, 0, 0.25)',
    '22px 22px 0px rgba(0, 0, 0, 0.25)',
    '22px 22px 0px rgba(0, 0, 0, 0.25)',
    '24px 24px 0px rgba(0, 0, 0, 0.25)',
    '24px 24px 0px rgba(0, 0, 0, 0.25)',
    '24px 24px 0px rgba(0, 0, 0, 0.25)',
    '24px 24px 0px rgba(0, 0, 0, 0.25)',
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          border: '4px solid',
          borderColor: retroColors.pixelBlack,
          padding: '12px 24px',
          transition: 'all 0.1s ease',
          position: 'relative',
          '&:hover': {
            transform: 'translate(2px, 2px)',
            boxShadow: '2px 2px 0px rgba(0, 0, 0, 0.25)',
          },
          '&:active': {
            transform: 'translate(4px, 4px)',
            boxShadow: 'none',
          },
        },
        contained: {
          boxShadow: '4px 4px 0px rgba(0, 0, 0, 0.25)',
        },
        containedPrimary: {
          backgroundColor: retroColors.retroCyan,
          '&:hover': {
            backgroundColor: retroColors.retroCyanLight,
          },
        },
        containedSecondary: {
          backgroundColor: retroColors.bubblegumPink,
          '&:hover': {
            backgroundColor: retroColors.bubblegumPinkLight,
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          border: `4px solid ${retroColors.pixelBlack}`,
          boxShadow: '8px 8px 0px rgba(0, 0, 0, 0.25)',
        },
        elevation1: {
          boxShadow: '4px 4px 0px rgba(0, 0, 0, 0.25)',
        },
        elevation2: {
          boxShadow: '6px 6px 0px rgba(0, 0, 0, 0.25)',
        },
        elevation3: {
          boxShadow: '8px 8px 0px rgba(0, 0, 0, 0.25)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: '16px',
          border: `3px solid ${retroColors.pixelBlack}`,
          fontWeight: 'bold',
          fontSize: '0.875rem',
        },
        colorPrimary: {
          backgroundColor: retroColors.chickenYellow,
          color: retroColors.pixelBlack,
        },
        colorSecondary: {
          backgroundColor: retroColors.bubblegumPink,
          color: retroColors.pixelWhite,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 0,
            '& fieldset': {
              borderWidth: '3px',
              borderColor: retroColors.pixelBlack,
            },
            '&:hover fieldset': {
              borderWidth: '3px',
              borderColor: retroColors.retroCyan,
            },
            '&.Mui-focused fieldset': {
              borderWidth: '3px',
              borderColor: retroColors.retroCyan,
            },
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 0,
          border: `6px solid ${retroColors.pixelBlack}`,
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          border: `3px solid ${retroColors.pixelBlack}`,
          fontWeight: 'bold',
        },
      },
    },
  },
});

export default retroTheme;

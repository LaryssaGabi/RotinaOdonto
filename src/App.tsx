import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box } from '@mui/material';
import KanbanBoard from './components/KanbanBoard';
import { DENTAL_THEME } from './utils/constants';

const theme = createTheme({
  palette: {
    primary: {
      main: DENTAL_THEME.colors.secondary,
      light: DENTAL_THEME.colors.primary,
      dark: '#0277BD',
    },
    secondary: {
      main: DENTAL_THEME.colors.primary,
    },
    background: {
      default: DENTAL_THEME.colors.white,
      paper: DENTAL_THEME.colors.white,
    },
    text: {
      primary: '#333333',
      secondary: DENTAL_THEME.colors.darkGray,
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
    },
    h6: {
      fontWeight: 600,
    },
    subtitle1: {
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          borderRadius: 8,
        },
      },
    },
    MuiFab: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ 
        minHeight: '100vh',
        backgroundColor: DENTAL_THEME.colors.white,
        backgroundImage: `linear-gradient(135deg, ${DENTAL_THEME.colors.white} 0%, ${DENTAL_THEME.colors.lightGray} 100%)`
      }}>
        <KanbanBoard />
      </Box>
    </ThemeProvider>
  );
}

export default App;
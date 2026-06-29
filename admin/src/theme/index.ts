import { createTheme } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Palette {
    neutral: Palette['primary'];
  }
  interface PaletteOptions {
    neutral: PaletteOptions['primary'];
  }
}

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    neutral: {
      main: '#64748B',
      contrastText: '#fff',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          textTransform: 'none',
          fontWeight: 500,
          paddingTop: '6px',
          paddingBottom: '6px',
          paddingLeft: '14px',
          paddingRight: '14px',
          fontSize: '0.8125rem',
          lineHeight: 1.5,
          minHeight: '34px',
          '@media (min-width: 1280px)': {
            paddingTop: '7px',
            paddingBottom: '7px',
            paddingLeft: '16px',
            paddingRight: '16px',
            fontSize: '0.875rem',
            minHeight: '36px',
          },
        },
        sizeSmall: {
          borderRadius: '6px',
          paddingTop: '3px',
          paddingBottom: '3px',
          paddingLeft: '10px',
          paddingRight: '10px',
          fontSize: '0.75rem',
          minHeight: '28px',
          '@media (min-width: 1280px)': {
            paddingTop: '4px',
            paddingBottom: '4px',
            minHeight: '30px',
          },
        },
        sizeLarge: {
          borderRadius: '10px',
          paddingTop: '9px',
          paddingBottom: '9px',
          fontSize: '0.9375rem',
          minHeight: '42px',
          '@media (min-width: 1280px)': {
            paddingTop: '10px',
            paddingBottom: '10px',
            minHeight: '44px',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: '4px',
        },
      },
    },
  },
});

export default theme; 
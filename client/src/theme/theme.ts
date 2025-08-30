'use client';
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#fa9500', // Senin seçtiğin ana renk
    },
    secondary: {
      main: '#ffdac6', // Senin seçtiğin ikincil renk
    },
    background: {
      default: '#fdfcf7', // Benim önerdiğim arka plan rengi
      paper: '#ffffff',   // Kartlar, dialog'lar gibi yüzeyler beyaz kalacak
    },
    text: {
      primary: '#4e423a', // Benim önerdiğim ana metin rengi
      secondary: '#796a5f', // Daha soluk ikincil metin rengi
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h4: {
      fontWeight: 700, // Başlıkları daha belirgin yapalım
    },
    h5: {
      fontWeight: 600,
    },
  },
  components: {
    // Butonların varsayılan stilini biraz daha modern yapalım
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8, // Daha yuvarlak köşeler
          textTransform: 'none', // METİNLER BÜYÜK HARF OLMASIN
          fontWeight: 600,
        },
      },
    },
    // Kartların (Paper) varsayılan stilini belirleyelim
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12, // Daha yumuşak, yuvarlak köşeler
        },
      },
    },
  },
});

export default theme;
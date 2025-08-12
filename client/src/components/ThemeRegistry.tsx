// Dosya: client/src/components/ThemeRegistry.tsx
'use client';
import * as React from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import NextAppDirEmotionCacheProvider from './EmotionCache';

export default function ThemeRegistry({ children }: { children: React.ReactNode }) {
 

  // useMediaQuery ve React.useMemo'yu kaldırıyoruz.
  // Temayı her zaman 'light' modda, sabit bir şekilde oluşturuyoruz.
  const theme = createTheme({
    palette: {
      mode: 'light', // Modu 'light' olarak sabitliyoruz.
      
      // Açık mod için istediğimiz renkleri burada tanımlayabiliriz.
      primary: {
        main: '#1976d2', 
      },
      secondary: {
        main: '#9c27b0', 
      },
      background: {
        default: '#f4f6f8', 
        paper: '#ffffff',  
      },
    },
  });

  
  return (
    <NextAppDirEmotionCacheProvider options={{ key: 'mui' }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </NextAppDirEmotionCacheProvider>
  );
}
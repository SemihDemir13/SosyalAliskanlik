// Dosya: client/src/app/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Box, CircularProgress } from '@mui/material';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    
    const token = localStorage.getItem('accessToken');

    if (token) {
      
      router.replace('/home');
    } else {
      
      router.replace('/login');
    }
  }, [router]); 

  
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
    >
      <CircularProgress />
    </Box>
  );
}
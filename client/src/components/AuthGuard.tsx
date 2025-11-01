// Dosya: client/src/components/AuthGuard.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, CircularProgress } from '@mui/material';
import { SignalRProvider } from '@/context/SignalRContext';


export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    
    if (token) {
      setIsLoading(false);
    } else {
      router.replace('/login'); 
    }
  }, [router]);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <SignalRProvider>
      {children}
    </SignalRProvider>
  );
}
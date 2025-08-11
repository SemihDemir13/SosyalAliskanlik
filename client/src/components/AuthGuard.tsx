// Dosya: client/src/components/AuthGuard.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, CircularProgress } from '@mui/material';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Bu efekt sadece component ilk yüklendiğinde çalışacak.
    const token = localStorage.getItem('accessToken');
    
    if (token) {
      // TODO: İleride token'ın geçerliliğini API'ye sorarak da kontrol edeceğim
      // Şimdilik sadece varlığını kontrol etmek yeterli.
      setIsAuthenticated(true);
    } else {
      router.replace('/login'); 
    }
    setIsLoading(false);
  }, [router]);

  // Kimlik durumu kontrol edilirken bir yükleme göstergesi göster
  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  // Eğer kullanıcı kimliği doğrulanmışsa, korumalı içeriği (çocukları) göster
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // Kimlik doğrulanmamışsa ve yönlendirme bekleniyorsa hiçbir şey gösterme
  return null;
}
// Dosya: client/src/components/AuthGuard.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Box, CircularProgress } from '@mui/material';

const PUBLIC_ROUTES = ['/login', '/register', '/please-confirm', '/confirm-email'];


export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname(); // Mevcut URL yolunu almak için hook
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Gidilmeye çalışılan sayfa, herkese açık bir sayfa mı?
    const isPublicPage = PUBLIC_ROUTES.some(path => pathname.startsWith(path));
    
    if (isPublicPage) {
      // Eğer herkese açık bir sayfadaysak, bir şey yapma, yüklemeyi bitir.
      setIsLoading(false);
      return;
    }

    // Korumalı bir sayfaya erişmeye çalışıyor, token'ı kontrol et.
    const token = localStorage.getItem('accessToken');
    
    if (!token) {
      // Token yoksa ve korumalı bir sayfaya gitmeye çalışıyorsa, login'e yönlendir.
      router.replace('/login');
    } else {
      // Token var, yüklemeyi bitir ve içeriği göster.
      setIsLoading(false);
    }
  }, [pathname, router]);

  // Yükleme sırasında animasyon göster
  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }
  
  // Yükleme bitti, içeriği göster
  return <>{children}</>;
}
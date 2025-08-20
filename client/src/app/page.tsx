// Dosya: client/src/app/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Box, CircularProgress } from '@mui/material';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Bu bileşen yüklendiğinde, tarayıcının localStorage'ını kontrol et.
    const token = localStorage.getItem('accessToken');

    if (token) {
      // Eğer token varsa, kullanıcı giriş yapmış demektir. Dashboard'a yönlendir.
      router.replace('/dashboard');
    } else {
      // Eğer token yoksa, kullanıcı giriş yapmamış demektir. Login sayfasına yönlendir.
      router.replace('/login');
    }
  }, [router]); // useEffect'in sadece bir kez çalışmasını sağlıyoruz.

  // Yönlendirme işlemi gerçekleşene kadar ekranda bir yükleme animasyonu göster.
  // Bu, anlık olarak boş bir sayfa görmeyi engeller.
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
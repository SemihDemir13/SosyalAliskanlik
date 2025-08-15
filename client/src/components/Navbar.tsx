// Dosya: client/src/components/Navbar.tsx
'use client';

import { useRouter } from 'next/navigation';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';

export default function Navbar() {
  const router = useRouter();

  const handleLogout = () => {
    // Tarayıcı deposundaki token'ı sil
    localStorage.removeItem('accessToken');
    // Kullanıcıyı giriş sayfasına yönlendir
    router.push('/login');
  };
  
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1, cursor: 'pointer' }} onClick={() => router.push('/dashboard')}>
          Alışkanlık Takipçisi
        </Typography>
        <Box>
  <Button color="inherit" onClick={() => router.push('/dashboard')}>
    Anasayfa
  </Button>
  
  <Button color="inherit" onClick={() => router.push('/statistics')}>  İstatistikler</Button>
  <Button color="inherit" onClick={() => router.push('/friends')}> Arkadaşlar </Button>
   <Button color="inherit" onClick={() => router.push('/profile')}>Profilim</Button>
  <Button color="inherit" onClick={handleLogout}>Çıkış Yap </Button>
</Box>
      </Toolbar>
    </AppBar>
  );
}
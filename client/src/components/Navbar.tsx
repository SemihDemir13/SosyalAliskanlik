// Dosya: client/src/components/Navbar.tsx
'use client';

import { useRouter } from 'next/navigation';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import Link from 'next/link';

export default function Navbar() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    router.push('/login');
  };
  
 return (
    <AppBar position="static">
      <Toolbar>
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ flexGrow: 1, cursor: 'pointer' }} 
          onClick={() => router.push('/home')} // Logoya tıklayınca /home'a gitsin
        >
          Alışkanlık Takipçisi
        </Typography>
        <Box>
          <Button color="inherit" component={Link} href="/home">
            Anasayfa
          </Button>
          <Button color="inherit" component={Link} href="/dashboard">
            Dashboard
          </Button>
          <Button color="inherit" component={Link} href="/statistics">
            İstatistikler
          </Button>
          <Button color="inherit" component={Link} href="/friends">
            Arkadaşlar
          </Button>
          <Button color="inherit" component={Link} href="/profile">
            Profilim
          </Button>
          <Button color="inherit" onClick={handleLogout}>
            Çıkış Yap
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
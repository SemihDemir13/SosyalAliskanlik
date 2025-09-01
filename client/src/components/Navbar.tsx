// Dosya: client/src/components/Navbar.tsx
'use client';

import { useRouter } from 'next/navigation';
import { AppBar, Toolbar, Typography, Button, Box, IconButton, Badge } from '@mui/material';
import Link from 'next/link';
import MailIcon from '@mui/icons-material/Mail';
import { useSignalR } from '@/context/SignalRContext';


export default function Navbar() {
  const router = useRouter();

    const { friendRequests } = useSignalR();


const handleLogout = () => {
    localStorage.removeItem('accessToken');
    router.push('/login');
  };
  
    const newRequestsCount = friendRequests.length;

 return (
    <AppBar position="static">
      <Toolbar>
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ flexGrow: 1, cursor: 'pointer' }} 
          onClick={() => router.push('/home')}
        >
          Alışkanlık Takipçisi
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Button color="inherit" component={Link} href="/home">
            Anasayfa
          </Button>
          <Button color="inherit" component={Link} href="/dashboard">
            Dashboard
          </Button>
          <Button color="inherit" component={Link} href="/statistics">
            İstatistikler
          </Button>
          
          {/* GÜNCELLENDİ: "Arkadaşlar" butonu artık dinamik bir bildirim ikonu içeriyor */}
          <Button color="inherit" component={Link} href="/friends" sx={{ mr: 2 }}>
            <Badge badgeContent={newRequestsCount} color="error">
              Arkadaşlar
            </Badge>
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
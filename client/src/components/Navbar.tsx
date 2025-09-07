// Dosya: client/src/components/Navbar.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppBar, Toolbar, Typography, Box, IconButton, Badge, Menu, MenuItem, Tooltip, Divider } from '@mui/material';
import Link from 'next/link';
import { useSignalR } from '@/context/SignalRContext';

// Kullanacağımız ikonlar
import HomeIcon from '@mui/icons-material/Home';
import DashboardIcon from '@mui/icons-material/Dashboard';
import MailIcon from '@mui/icons-material/Mail';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountCircle from '@mui/icons-material/AccountCircle';
import BarChartIcon from '@mui/icons-material/BarChart';
import PeopleIcon from '@mui/icons-material/People';

export default function Navbar() {
  const router = useRouter();
  const { friendRequests, unreadMessageCount } = useSignalR();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleClose();
    localStorage.removeItem('accessToken');
    router.push('/login');
  };
  
  const totalNotifications = friendRequests.length;

  return (
    <AppBar position="static">
      <Toolbar>
        {/* SOL TARAF */}
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ flexGrow: 1, cursor: 'pointer', fontWeight: 'bold' }} 
          onClick={() => router.push('/home')}
        >
          Sosyal Alışkanlık
        </Typography>

        {/* SAĞ TARAF */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          
          <Tooltip title="Anasayfa">
            <IconButton color="inherit" component={Link} href="/home">
              <HomeIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Dashboard">
            <IconButton color="inherit" component={Link} href="/dashboard">
              <DashboardIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Arkadaşlar">
            <IconButton color="inherit" component={Link} href="/friends">
              <PeopleIcon />
            </IconButton>
          </Tooltip>
          

          <Tooltip title="Mesajlar">
            <IconButton color="inherit" component={Link} href="/messages">
              <Badge badgeContent={unreadMessageCount} color="error">
                <MailIcon />
              </Badge>
            </IconButton>
          </Tooltip>

          <Tooltip title="Bildirimler">
            <IconButton color="inherit">
              <Badge badgeContent={totalNotifications} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>

          <Tooltip title="Hesap">
            <IconButton onClick={handleMenu} color="inherit">
              <AccountCircle />
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
            PaperProps={{
              sx: {
                overflow: 'visible',
                filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                mt: 1.5,
                '& .MuiAvatar-root': {
                  width: 32,
                  height: 32,
                  ml: -0.5,
                  mr: 1,
                },
                '&:before': {
                  content: '""',
                  display: 'block',
                  position: 'absolute',
                  top: 0,
                  right: 14,
                  width: 10,
                  height: 10,
                  bgcolor: 'background.paper',
                  transform: 'translateY(-50%) rotate(45deg)',
                  zIndex: 0,
                },
              },
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem component={Link} href="/profile" onClick={handleClose}>
              <AccountCircle sx={{ mr: 1 }} /> Profilim
            </MenuItem>
            <MenuItem component={Link} href="/statistics" onClick={handleClose}>
              <BarChartIcon sx={{ mr: 1 }} /> İstatistikler
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
              Çıkış Yap
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
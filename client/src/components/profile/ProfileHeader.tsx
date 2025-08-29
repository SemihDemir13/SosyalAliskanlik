'use client';
import { Avatar, Box, Paper, Typography } from '@mui/material';

interface ProfileHeaderProps {
    name: string;
    email: string;
}

// Kullanıcının isminden avatar için rastgele ama tutarlı bir renk üreten fonksiyon
function stringToColor(string: string) {
  let hash = 0;
  for (let i = 0; i < string.length; i += 1) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = '#';
  for (let i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }
  return color;
}

export default function ProfileHeader({ name, email }: ProfileHeaderProps) {
    return (
        <Paper elevation={3} sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 3 }}>
            <Avatar 
                sx={{ 
                    bgcolor: stringToColor(name), 
                    width: 80, 
                    height: 80,
                    fontSize: '2.5rem'
                }}
            >
                {name.charAt(0).toUpperCase()}
            </Avatar>
            <Box>
                <Typography variant="h4" component="h1" fontWeight="bold">
                    {name}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    {email}
                </Typography>
            </Box>
        </Paper>
    );
}

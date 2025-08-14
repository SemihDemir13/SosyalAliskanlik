// Dosya: client/src/components/friends/FriendList.tsx
'use client';

import axios from 'axios';
import { Typography, List, ListItem, ListItemText, Paper, IconButton, Link as MuiLink } from '@mui/material'; // MUI'nin Link'ini de import ediyoruz
import DeleteIcon from '@mui/icons-material/Delete';
import { useSnackbar } from 'notistack';
import Link from 'next/link'; // Next.js'in Link bileşenini import ediyoruz

export interface Friend {
  friendshipId: string;
  friendId: string;
  friendName: string;
}

interface FriendListProps {
  friends: Friend[];
  onAction: () => void;
}

export default function FriendList({ friends, onAction }: FriendListProps) {
  const { enqueueSnackbar } = useSnackbar();

  const handleRemoveFriend = async (friend: Friend) => {
    if (!window.confirm(`'${friend.friendName}' adlı kişiyi arkadaşlıktan çıkarmak istediğinize emin misiniz?`)) {
      return;
    }
    try {
      const token = localStorage.getItem('accessToken');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      await axios.delete(`${apiUrl}/api/Friends/${friend.friendshipId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      enqueueSnackbar(`${friend.friendName} arkadaşlıktan çıkarıldı.`, { variant: 'success' });
      onAction();
    } catch (error: any) {
      enqueueSnackbar(error.response?.data?.message || 'Bir hata oluştu.', { variant: 'error' });
    }
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>Arkadaşlarım ({friends.length})</Typography>
      {friends.length > 0 ? (
        <List>
          {friends.map((friend) => (
            <ListItem 
              key={friend.friendshipId}
              secondaryAction={
                <IconButton edge="end" aria-label="delete" onClick={() => handleRemoveFriend(friend)}>
                  <DeleteIcon />
                </IconButton>
              }
            >
              {/* --- LİNK KISMININ DOĞRU KULLANIMI --- */}
              <MuiLink 
                component={Link} 
                href={`/friends/${friend.friendId}`} 
                underline="hover" 
                color="inherit"
              >
                <ListItemText primary={friend.friendName} />
              </MuiLink>
              {/* --- BİTTİ --- */}
            </ListItem>
          ))}
        </List>
      ) : (
        <Typography variant="body2" color="text.secondary">Henüz hiç arkadaşın yok.</Typography>
      )}
    </Paper>
  );
}
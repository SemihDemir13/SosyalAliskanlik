// Dosya: client/src/components/friends/FriendList.tsx
'use client';

import axios from 'axios';
import { Typography, List, ListItem, ListItemText, Paper, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useSnackbar } from 'notistack';

export interface Friend {
  friendshipId: string;
  friendId: string;
  friendName: string;
}

interface FriendListProps {
  friends: Friend[];
  onAction: () => void; // Arkadaş silindiğinde listeyi yenilemek için
}

export default function FriendList({ friends, onAction }: FriendListProps) {
  const { enqueueSnackbar } = useSnackbar();

  const handleRemoveFriend = async (friend: Friend) => {
    // Silmeden önce kullanıcıdan onay al
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
      onAction(); // Ana bileşene listeyi yenilemesi için haber ver
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
              <ListItemText primary={friend.friendName} />
            </ListItem>
          ))}
        </List>
      ) : (
        <Typography variant="body2" color="text.secondary">Henüz hiç arkadaşın yok.</Typography>
      )}
    </Paper>
  );
}
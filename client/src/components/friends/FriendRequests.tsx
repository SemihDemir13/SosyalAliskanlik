// Dosya: client/src/components/friends/FriendRequests.tsx
'use client';

import axios from 'axios';
import { Box, Typography, List, ListItem, ListItemText, Button, Paper, Stack } from '@mui/material';
import { useSnackbar } from 'notistack';

export interface FriendRequest {
  friendshipId: string;
  requesterId: string;
  requesterName: string;
  requestedAt: string;
}

interface FriendRequestsProps {
  requests: FriendRequest[];
  onAction: () => void; // Bir aksiyon alındığında ana sayfaya haber vermek için
}

export default function FriendRequests({ requests, onAction }: FriendRequestsProps) {
  const { enqueueSnackbar } = useSnackbar();

  const handleRequestAction = async (friendshipId: string, action: 'accept' | 'decline') => {
    try {
      const token = localStorage.getItem('accessToken');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      await axios.post(`${apiUrl}/api/Friends/requests/${friendshipId}/${action}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      enqueueSnackbar(`İstek ${action === 'accept' ? 'kabul edildi' : 'reddedildi'}.`, { variant: 'success' });
      onAction(); // Listeyi yenilemek için ana bileşene haber ver
    } catch (error: any) {
      enqueueSnackbar(error.response?.data?.message || 'İşlem başarısız.', { variant: 'error' });
    }
  };

  if (requests.length === 0) {
    return null; // Eğer hiç istek yoksa bu bileşeni hiç gösterme
  }

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>Gelen İstekler ({requests.length})</Typography>
      <List>
        {requests.map((req) => (
          <ListItem key={req.friendshipId}>
            <ListItemText primary={req.requesterName} secondary="sana bir arkadaşlık isteği gönderdi." />
            <Stack direction="row" spacing={1}>
              <Button variant="contained" size="small" onClick={() => handleRequestAction(req.friendshipId, 'accept')}>Kabul Et</Button>
              <Button variant="outlined" size="small" onClick={() => handleRequestAction(req.friendshipId, 'decline')}>Reddet</Button>
            </Stack>
          </ListItem>
        ))}
      </List>
    </Paper>
  );
}
// Dosya: client/src/app/(app)/messages/page.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { Container, Typography, Box, List, ListItem, ListItemButton, ListItemText, ListItemAvatar, Avatar, Badge, CircularProgress, Divider } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useSignalR } from '@/context/SignalRContext';
import { ConversationDto } from '@/types';

export default function MessagesPage() {
  const [conversations, setConversations] = useState<ConversationDto[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const { liveMessages, unreadMessageCount, setUnreadMessageCount } = useSignalR();

  const fetchConversations = useCallback(async () => {
    setLoading(true);
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const response = await axios.get(`${apiUrl}/api/Messaging/conversations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setConversations(response.data);
      const totalUnread = response.data.reduce((sum: number, conv: ConversationDto) => sum + conv.unreadCount, 0);
      setUnreadMessageCount(totalUnread);
    } catch (error) {
      console.error("Konuşmalar çekilirken hata oluştu:", error);
      enqueueSnackbar('Konuşmalar yüklenirken bir hata oluştu.', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [router, enqueueSnackbar, setUnreadMessageCount]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    if (liveMessages.length > 0) {
      fetchConversations();
    }
  }, [liveMessages, fetchConversations]);

  const handleConversationClick = (conversationId: string) => {
    router.push(`/messages/${conversationId}`);
  };

  if (loading) {
    return <Box display="flex" justifyContent="center" sx={{ mt: 4 }}><CircularProgress /></Box>;
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Mesajlar
        </Typography>
        
        {conversations.length === 0 ? (
          <Typography color="text.secondary" sx={{ mt: 2 }}>
            Henüz bir konuşmanız yok.
          </Typography>
        ) : (
          <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
            {conversations.map((conv) => (
              <Box key={conv.id}>
                <ListItemButton alignItems="flex-start" onClick={() => handleConversationClick(conv.id)}>
                  <ListItemAvatar>
                    <Badge color="error" badgeContent={conv.unreadCount} max={9}>
                      <Avatar alt={conv.otherUserName} src={`/avatars/${conv.otherUserName}.jpg`} />
                    </Badge>
                  </ListItemAvatar>
                  <ListItemText
                    primary={conv.otherUserName}
                    secondary={
                      <Typography
                        sx={{ display: 'inline' }}
                        component="span"
                        variant="body2"
                        color="text.primary"
                      >
                        {conv.lastMessage || 'Henüz mesaj yok...'}
                      </Typography>
                    }
                  />
                  {conv.lastMessageTimestamp && (
                    <Typography variant="caption" color="text.secondary">
                      {new Date(conv.lastMessageTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Typography>
                  )}
                </ListItemButton>
                <Divider variant="inset" component="li" />
              </Box>
            ))}
          </List>
        )}
      </Box>
    </Container>
  );
}
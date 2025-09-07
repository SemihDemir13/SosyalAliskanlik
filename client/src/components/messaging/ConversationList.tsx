// Dosya: client/src/components/messaging/ConversationList.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useRouter, useParams } from 'next/navigation';
import { Typography, Box, List, ListItemButton, ListItemText, ListItemAvatar, Avatar, Badge, CircularProgress, Divider, TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useSignalR } from '@/context/SignalRContext';
import { ConversationDto } from '@/types';

export default function ConversationList() {
  const [conversations, setConversations] = useState<ConversationDto[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const params = useParams();
  const activeConversationId = params.conversationId as string;
  const { liveMessages, setUnreadMessageCount } = useSignalR();

  const fetchConversations = useCallback(async () => {
    // ... (Bu fonksiyon bir önceki `/messages/page.tsx`'den neredeyse aynı)
    const token = localStorage.getItem('accessToken');
    if (!token) { /*...*/ return; }
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const response = await axios.get(`${apiUrl}/api/Messaging/conversations`, { headers: { Authorization: `Bearer ${token}` } });
      setConversations(response.data);
      const totalUnread = response.data.reduce((sum: number, conv: ConversationDto) => sum + conv.unreadCount, 0);
      setUnreadMessageCount(totalUnread);
    } catch (error) { console.error("Konuşmalar çekilirken hata:", error); } 
    finally { setLoading(false); }
  }, [setUnreadMessageCount]);

  useEffect(() => { fetchConversations(); }, [fetchConversations]);
  useEffect(() => { if (liveMessages.length > 0) fetchConversations(); }, [liveMessages, fetchConversations]);

  const handleConversationClick = (conversationId: string) => {
    router.push(`/messages/${conversationId}`);
  };

  if (loading) {
    return <Box display="flex" justifyContent="center" alignItems="center" sx={{ height: '100%' }}><CircularProgress /></Box>;
  }
  
  return (
    <>
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6">Sohbetler</Typography>
        {/* Arama çubuğu eklenebilir */}
      </Box>
      <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
        <List sx={{ p: 0 }}>
          {conversations.map((conv) => (
            <ListItemButton
              key={conv.id}
              onClick={() => handleConversationClick(conv.id)}
              selected={conv.id === activeConversationId} // Aktif konuşmayı vurgula
            >
              <ListItemAvatar>
                <Badge color="error" badgeContent={conv.unreadCount} max={9}>
                  <Avatar alt={conv.otherUserName} />
                </Badge>
              </ListItemAvatar>
              <ListItemText
                primary={conv.otherUserName}
                secondary={conv.lastMessage || '...'}
                secondaryTypographyProps={{ noWrap: true, textOverflow: 'ellipsis' }}
              />
            </ListItemButton>
          ))}
        </List>
      </Box>
    </>
  );
}
// Dosya: client/src/app/(app)/messages/[conversationId]/page.tsx
'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import axios from 'axios';
import { useRouter, useParams } from 'next/navigation';
import { Container, Typography, Box, CircularProgress, Paper, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useSnackbar } from 'notistack';
import { useSignalR } from '@/context/SignalRContext';
import { MessageDto, ConversationDto } from '@/types';
import MessageBubble from '@/components/messaging/MessageBubble';
import MessageInput from '@/components/messaging/MessageInput';

export default function ConversationPage() {
  const params = useParams();
  const conversationId = params.conversationId as string;

  const [messages, setMessages] = useState<MessageDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [otherUser, setOtherUser] = useState<{ id: string; name: string } | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const { liveMessages, setUnreadMessageCount, setActiveConversationId } = useSignalR();
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(scrollToBottom, [messages]);

  // Bu useEffect bloğu, bu sohbet ekranı açıldığında ve kapandığında Context'i bilgilendirir.
  useEffect(() => {
    // Bileşen ekrana geldiğinde, context'e hangi konuşmanın aktif olduğunu söyle.
    if (conversationId) {
      setActiveConversationId(conversationId);
    }

    // Bu "cleanup" fonksiyonu, bileşen ekrandan kaldırıldığında çalışır.
    return () => {
      // Artık aktif bir konuşma olmadığını context'e bildir.
      setActiveConversationId(null);
    };
  }, [conversationId, setActiveConversationId]);

  const fetchInitialData = useCallback(async () => {
    setLoading(true);
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
      return;
    }
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setCurrentUserId(payload.sub);
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      
      const [messagesRes, convsRes] = await Promise.all([
        axios.get(`${apiUrl}/api/Messaging/conversations/${conversationId}/messages`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${apiUrl}/api/Messaging/conversations`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      setMessages(messagesRes.data);

      const currentConv = convsRes.data.find((c: ConversationDto) => c.id === conversationId);
      if (currentConv) {
        setOtherUser({ id: currentConv.otherUserId, name: currentConv.otherUserName });
      }

      await axios.post(`${apiUrl}/api/Messaging/conversations/${conversationId}/mark-as-read`, {}, { headers: { Authorization: `Bearer ${token}` } });
      
      const updatedConvsRes = await axios.get(`${apiUrl}/api/Messaging/conversations`, { headers: { Authorization: `Bearer ${token}` } });
      const totalUnread = updatedConvsRes.data.reduce((sum: number, conv: ConversationDto) => sum + conv.unreadCount, 0);
      setUnreadMessageCount(totalUnread);

    } catch (error) {
      console.error("Sohbet verileri çekilirken hata oluştu:", error);
      enqueueSnackbar('Sohbet yüklenirken bir hata oluştu.', { variant: 'error' });
      router.push('/messages');
    } finally {
      setLoading(false);
    }
  }, [conversationId, router, enqueueSnackbar, setUnreadMessageCount]);

  useEffect(() => {
    if (conversationId) {
      fetchInitialData();
    }
  }, [fetchInitialData, conversationId]);

  useEffect(() => {
    const newMessagesForThisConversation = liveMessages.filter(
      (liveMsg) =>
        liveMsg.conversationId === conversationId &&
        !messages.some((existingMsg) => existingMsg.id === liveMsg.id)
    );

    if (newMessagesForThisConversation.length > 0) {
      setMessages((prevMessages) => [...prevMessages, ...newMessagesForThisConversation]);
    }
  }, [liveMessages, conversationId, messages]);

  const handleSendMessage = async (content: string) => {
    const token = localStorage.getItem('accessToken');
    if (!token || !currentUserId || !otherUser) return;

    const optimisticMessage: MessageDto = {
      id: `temp_${Date.now()}`,
      conversationId,
      senderId: currentUserId,
      content,
      createdAt: new Date().toISOString(),
      isRead: false,
    };
    setMessages(prev => [...prev, optimisticMessage]);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const response = await axios.post(`${apiUrl}/api/Messaging/send`, 
        { receiverId: otherUser.id, content },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setMessages(prev => prev.map(m => m.id === optimisticMessage.id ? response.data : m));
    } catch (error) {
      console.error("Mesaj gönderilirken hata oluştu:", error);
      enqueueSnackbar('Mesaj gönderilemedi.', { variant: 'error' });
      setMessages(prev => prev.filter(m => m.id !== optimisticMessage.id));
    }
  };

  if (loading || !currentUserId) {
    return <Box display="flex" justifyContent="center" sx={{ mt: 4 }}><CircularProgress /></Box>;
  }

 return (
    // <Container> ve <Paper> sarmalayıcıları kaldırıldı.
    <>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', borderBottom: 1, borderColor: 'divider', flexShrink: 0 }}>
        <IconButton onClick={() => router.push('/messages')}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6" sx={{ ml: 1 }}>{otherUser?.name || 'Sohbet'}</Typography>
      </Box>

      <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2 }}>
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} isOwnMessage={msg.senderId === currentUserId} />
        ))}
        <div ref={messagesEndRef} />
      </Box>

      <Box sx={{ flexShrink: 0 }}>
          <MessageInput onSendMessage={handleSendMessage} />
      </Box>
    </>
  );
}
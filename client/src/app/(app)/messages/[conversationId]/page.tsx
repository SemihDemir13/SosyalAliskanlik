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
import apiClient from '@/utils/apiClient';

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
    
    // Güvenlik olarak token'ın varlığı kontrol
    const tokenExists = typeof window !== 'undefined' && localStorage.getItem('accessToken');
    if (!tokenExists) {
      router.push('/login');
      setLoading(false);
      return;
    }
    
    try {
      const payload = JSON.parse(atob(localStorage.getItem('accessToken')!.split('.')[1]));
      setCurrentUserId(payload.sub);
      
      
      const [messagesRes, convsRes] = await Promise.all([
        apiClient.get(`/api/Messaging/conversations/${conversationId}/messages`),
        apiClient.get(`/api/Messaging/conversations`)
      ]);

      setMessages(messagesRes.data);

      const currentConv = convsRes.data.find((c: ConversationDto) => c.id === conversationId);
      if (currentConv) {
        setOtherUser({ id: currentConv.otherUserId, name: currentConv.otherUserName });
      } else {
        enqueueSnackbar('Konuşma bulunamadı.', { variant: 'warning' });
        router.push('/messages');
        return;
      }

      await apiClient.post(`/api/Messaging/conversations/${conversationId}/mark-as-read`, {});
      
      // Okunmamış mesaj sayacını global olarak güncellemek için konuşmaları tekrar çek.
      const updatedConvsRes = await apiClient.get(`/api/Messaging/conversations`);
      const totalUnread = updatedConvsRes.data.reduce((sum: number, conv: ConversationDto) => sum + conv.unreadCount, 0);
      setUnreadMessageCount(totalUnread);

    } catch (error) {
      console.error("Sohbet verileri çekilirken hata oluştu:", error);
      
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        enqueueSnackbar('Oturumunuz sonlanmış, lütfen tekrar giriş yapın.', { variant: 'error' });
        router.push('/login');
      } else {
        enqueueSnackbar('Sohbet yüklenirken bir hata oluştu.', { variant: 'error' });
        router.push('/messages');
      }
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
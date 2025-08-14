// Dosya: client/src/app/(app)/friends/page.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Typography, Box, Stack, Divider, CircularProgress } from '@mui/material';
import UserSearch from '@/components/friends/UserSearch';
import FriendRequests, { FriendRequest } from '@/components/friends/FriendRequests';
import FriendList, { Friend } from '@/components/friends/FriendList';

export default function FriendsPage() {
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      // İki API isteğini aynı anda gönderiyoruz
      const [requestsRes, friendsRes] = await Promise.all([
        axios.get(`${apiUrl}/api/Friends/requests/pending`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${apiUrl}/api/Friends`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      
      setRequests(requestsRes.data);
      setFriends(friendsRes.data);
    } catch (error) {
      console.error("Arkadaş verileri çekilirken hata oluştu:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return <Box display="flex" justifyContent="center" sx={{ mt: 4 }}><CircularProgress /></Box>;
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h4" component="h1" gutterBottom>Arkadaşlar</Typography>
      <Stack direction={{ xs: 'column-reverse', md: 'row' }} spacing={4} sx={{ mt: 3 }}>
        <Box sx={{ flexGrow: 1 }}>
          <Stack spacing={3}>
            <FriendRequests requests={requests} onAction={fetchData} />
            <FriendList friends={friends} onAction={fetchData} />

          </Stack>
        </Box>
        <Box sx={{ width: { xs: '100%', md: '320px' }, flexShrink: 0 }}>
          <UserSearch />
        </Box>
      </Stack>
    </Box>
  );
}
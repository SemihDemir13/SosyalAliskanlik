// Dosya: client/src/app/(app)/friends/page.tsx
'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import axios from 'axios';
import { Typography, Box, Stack, CircularProgress } from '@mui/material';
import UserSearch from '@/components/friends/UserSearch';
import FriendRequests, { FriendRequest } from '@/components/friends/FriendRequests';
import FriendList, { Friend } from '@/components/friends/FriendList';
import { useSignalR } from '@/context/SignalRContext';

export default function FriendsPage() {
  const [initialRequests, setInitialRequests] = useState<FriendRequest[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);

  const { friendRequests: liveRequests, removeFriendRequest } = useSignalR();

  const fetchData = useCallback(async () => {
    if (loading === false) { 
      setLoading(true);
    }

    const token = localStorage.getItem('accessToken');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const [requestsRes, friendsRes] = await Promise.all([
        axios.get(`${apiUrl}/api/Friends/requests/pending`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${apiUrl}/api/Friends`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      
      setInitialRequests(requestsRes.data);
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

  
  const combinedRequests = useMemo(() => {
    
    const allRequestsMap = new Map<string, FriendRequest>();

    initialRequests.forEach(req => allRequestsMap.set(req.friendshipId, req));
    liveRequests.forEach(req => allRequestsMap.set(req.friendshipId, req));

    return Array.from(allRequestsMap.values());
  }, [initialRequests, liveRequests]);

  // FriendRequests bileşeninden bir aksiyon (kabul/red) tetiklendiğinde çalışacak fonksiyon.
  const handleRequestAction = (friendshipId: string) => {
    removeFriendRequest(friendshipId);
    
    //  Sayfayı yeniden doldur: API'yi tekrar çağırarak hem bekleyen istekler listesini
    fetchData();
  };

  if (loading) {
    return <Box display="flex" justifyContent="center" sx={{ mt: 4 }}><CircularProgress /></Box>;
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h4" component="h1" gutterBottom>Arkadaşlar</Typography>
      <Stack direction={{ xs: 'column-reverse', md: 'row' }} spacing={4} sx={{ mt: 3 }}>
        
        <Box sx={{ flexGrow: 1 }}>
          <Stack spacing={3}>
            {/* Artık `FriendRequests` bileşenine birleştirilmiş ve canlı listeyi
                ve aksiyonlar için yeni `handleRequestAction` fonksiyonunu iletiyoruz. */}
            <FriendRequests requests={combinedRequests} onAction={handleRequestAction} />
            
            {/* `FriendList` bileşeni, bir arkadaş silindiğinde `fetchData`'yı çağırabilir. */}
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
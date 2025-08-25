// Dosya: client/src/app/(app)/dashboard/page.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import ActivityFeed from '@/components/feed/ActivityFeed';
import { Activity } from '@/types'; 
import { Container, Typography, Box } from '@mui/material';
import { useSnackbar } from 'notistack';

export default function DashboardPage() {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  
  const [activities, setActivities] = useState<Activity[]>([]);
  const [feedLoading, setFeedLoading] = useState(true);
  const [userName, setUserName] = useState<string | null>(null);

  const fetchActivityFeed = useCallback(async () => {
    setFeedLoading(true);
    const token = localStorage.getItem('accessToken');
    if (!token) {
        router.push('/login');
        return;
    }
    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const response = await axios.get(`${apiUrl}/api/Activity/feed`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        setActivities(response.data);
    } catch (err: any) { 
        console.error("Akış verisi yüklenirken hata:", err);

       
        if (err.response && err.response.status === 401) {
            // Eğer 401 hatası aldıysak, token geçersizdir.
            enqueueSnackbar('Oturumunuzun süresi doldu. Lütfen tekrar giriş yapın.', { variant: 'error' });
            localStorage.removeItem('accessToken'); // Geçersiz token'ı temizle
            router.push('/login'); // Login sayfasına yönlendir
        } else {
            // Diğer hatalar için genel bir mesaj 
            enqueueSnackbar('Aktivite akışı yüklenirken bir sorun oluştu.', { variant: 'warning' });
        }
    } finally {
        setFeedLoading(false);
    }
}, [enqueueSnackbar, router]);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            setUserName(payload.name);
        } catch (e) { console.error("Token ayrıştırılamadı:", e); }
    }
    fetchActivityFeed();
  }, [fetchActivityFeed]);
  
  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Merhaba, {userName || 'Kullanıcı'}!
        </Typography>
        <Typography color="text.secondary">
          Arkadaşlarından ve senden son haberler burada.
        </Typography>

        <Box sx={{ mt: 4 }}>
          <ActivityFeed activities={activities} isLoading={feedLoading} />
        </Box>
      </Box>
    </Container>
  );
}

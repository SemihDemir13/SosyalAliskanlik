// Dosya: client/src/app/(app)/home/page.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import ActivityFeed from '@/components/feed/ActivityFeed';
import { Activity } from '@/types'; 
import { Container, Typography, Box } from '@mui/material';
import { useSnackbar } from 'notistack';

export default function HomePage() {
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
          enqueueSnackbar('Oturumunuzun süresi doldu. Lütfen tekrar giriş yapın.', { variant: 'error' });
          localStorage.removeItem('accessToken');
          router.push('/login');
      } else {
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
    } else {
        router.push('/login');
        return;
    }
    
    // Geriye dönük rozet kontrolünü tetikleyen fonksiyon
    const recheckBadges = async () => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL;
            // Bu istek arka planda çalışır, sonucunu beklememize veya göstermemize gerek yok.
            // Sadece tetikliyoruz.
            await axios.post(`${apiUrl}/api/Badges/recheck`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            console.log("Geçmiş başarılar için rozetler yeniden kontrol edildi.");
            localStorage.setItem('badges_need_refresh', 'true');
        } catch (error) {
            console.error("Rozetler yeniden kontrol edilirken hata oluştu:", error);
        }
    };

    // Sayfa yüklendiğinde hem akışı çek hem de rozetleri kontrol et
    fetchActivityFeed();
    recheckBadges();

  }, [fetchActivityFeed, router]);
  
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
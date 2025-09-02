// Dosya: client/src/app/(app)/home/page.tsx
'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import ActivityFeed from '@/components/feed/ActivityFeed';
import { Activity } from '@/types'; 
import { Container, Typography, Box, CircularProgress } from '@mui/material'; // CircularProgress eklendi
import { useSnackbar } from 'notistack';
// ADIM 1: SignalR hook'unu import ediyoruz
import { useSignalR } from '@/context/SignalRContext';

export default function HomePage() {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  
  // ADIM 2: State'i ayırıyoruz
  // Bu state artık sadece API'den gelen ilk aktiviteleri tutacak
  const [initialActivities, setInitialActivities] = useState<Activity[]>([]);
  const [feedLoading, setFeedLoading] = useState(true);
  const [userName, setUserName] = useState<string | null>(null);

  // SignalR context'inden canlı gelen aktiviteleri alıyoruz
  const { liveActivities } = useSignalR();

  const fetchActivityFeed = useCallback(async () => {
    // Sadece ilk yüklemede bu state'i true yapalım ki
    // canlı güncellemelerde tüm sayfa tekrar yükleniyor gibi görünmesin.
    if (!initialActivities.length) {
        setFeedLoading(true);
    }
    
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
      // activities yerine initialActivities state'ini güncelliyoruz
      setInitialActivities(response.data);
    } catch (err: any) {
      console.error("Akış verisi yüklenirken hata:", err);
      if (err.response?.status === 401) {
          enqueueSnackbar('Oturumunuzun süresi doldu. Lütfen tekrar giriş yapın.', { variant: 'error' });
          localStorage.removeItem('accessToken');
          router.push('/login');
      } else {
        enqueueSnackbar('Aktivite akışı yüklenirken bir sorun oluştu.', { variant: 'warning' });
      }
    } finally {
      setFeedLoading(false);
    }
  }, [enqueueSnackbar, router, initialActivities.length]); // initialActivities.length'i bağımlılığa ekledik

  useEffect(() => {
    // ... (Token ve userName alma mantığı aynı) ...
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
    
    const recheckBadges = async () => { /* ... (Bu fonksiyon aynı kalıyor) ... */ };

    fetchActivityFeed();
    recheckBadges();

  }, [fetchActivityFeed, router]);

  // ADIM 3: API'den gelen ve SignalR'dan gelen aktiviteleri birleştiriyoruz
  const combinedActivities = useMemo(() => {
    // Duplikasyonları engellemek için Map yapısı kullanıyoruz
    const allActivitiesMap = new Map<string, Activity>();

    // Önce canlı (yeni) aktiviteleri ekliyoruz ki sıralamada en üste gelsinler
    liveActivities.forEach(act => allActivitiesMap.set(act.id, act));
    
    // Sonra API'den gelen eski aktiviteleri ekliyoruz. Eğer Map'te zaten varsa (canlı olarak gelmişse), tekrar eklenmez.
    initialActivities.forEach(act => {
        if (!allActivitiesMap.has(act.id)) {
            allActivitiesMap.set(act.id, act);
        }
    });

    // Map'teki tüm aktiviteleri bir diziye çevirip tarihe göre (en yeni en üstte) sıralıyoruz.
    return Array.from(allActivitiesMap.values())
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); // `timestamp` yerine `createdAt`
        
  }, [initialActivities, liveActivities]);
  
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
          {/* ADIM 4: ActivityFeed'e artık birleştirilmiş ve her zaman güncel olan listeyi gönderiyoruz */}
          <ActivityFeed activities={combinedActivities} isLoading={feedLoading} />
        </Box>
      </Box>
    </Container>
  );
}
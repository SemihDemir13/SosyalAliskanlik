// Dosya: client/src/app/(app)/dashboard/page.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import AddHabitModal from '@/components/AddHabitModal';
import HabitList from '@/components/habits/HabitList';
import { Habit, Badge } from '@/types'; 
import { Container, Typography, Box, CircularProgress, Alert, Fab } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useSnackbar } from 'notistack';

export default function DashboardPage() {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  
  const [habits, setHabits] = useState<Habit[]>([]);
  const [userBadges, setUserBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchHabitsAndBadges = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
      return;
    }
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      // İki API isteğini aynı anda gönderiyoruz
      const [habitsResponse, badgesResponse] = await Promise.all([
          axios.get(`${apiUrl}/api/Habit`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${apiUrl}/api/Badges/my`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      // Alışkanlık verisini işle
      const todayStr = new Date().toISOString().split('T')[0];
      const habitsWithCompletionStatus = habitsResponse.data.map((habit: any) => ({
          ...habit,
          isCompletedToday: habit.completions.includes(todayStr)
      }));
      setHabits(habitsWithCompletionStatus);
      
      // Rozet verisini state'e ata
      setUserBadges(badgesResponse.data);
      setError(null);

    } catch (err: any) {
        if (err.response && err.response.status === 401) {
            enqueueSnackbar('Oturumunuzun süresi doldu. Lütfen tekrar giriş yapın.', { variant: 'error' });
            localStorage.removeItem('accessToken');
            router.push('/login');
        } else {
            setError('Veriler yüklenirken bir hata oluştu.');
        }
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [router, enqueueSnackbar]);
  
  useEffect(() => {
    fetchHabitsAndBadges(true);
  }, [fetchHabitsAndBadges]);

  useEffect(() => {
    // Bu log'lar, hem habits hem de userBadges state'i güncellendiğinde çalışacak.
    if (habits.length > 0 && userBadges.length > 0) {
        console.log("--- VERİ KONTROLÜ ---");
        
        // 1. Alışkanlık isimlerini bir dizi olarak yazdır.
        const habitNames = habits.map(h => h.name);
        console.log("Alışkanlık İsimleri:", habitNames);

        // 2. Rozetlerin bağlı olduğu alışkanlık isimlerini yazdır.
        const badgeHabitNames = userBadges
            .map(b => b.relatedHabitName)
            .filter(name => name != null); // Sadece null olmayanları al
        console.log("Rozetlerin Alışkanlıkları:", badgeHabitNames);

        // 3. Eşleşme olup olmadığını manuel olarak kontrol et.
        const firstHabitName = habitNames.length > 0 ? habitNames[0] : null;
        const firstBadgeHabitName = badgeHabitNames.length > 0 ? badgeHabitNames[0] : null;

        if (firstHabitName && firstBadgeHabitName) {
            console.log(`İlk alışkanlık ('${firstHabitName}') ile ilk rozet alışkanlığı ('${firstBadgeHabitName}') eşleşiyor mu?`, firstHabitName === firstBadgeHabitName);
        }
        console.log("--- KONTROL BİTTİ ---");
    }
  }, [habits, userBadges]);

  const handleToggleHabit = async (habitId: string) => {
    const originalHabits = [...habits];
    const updatedHabits = habits.map(habit => 
        habit.id === habitId ? { ...habit, isCompletedToday: !habit.isCompletedToday } : habit
    );
    setHabits(updatedHabits);
    try {
        const token = localStorage.getItem('accessToken');
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        await axios.post(`${apiUrl}/api/Habit/${habitId}/toggle`, {}, { headers: { Authorization: `Bearer ${token}` } });
        await fetchHabitsAndBadges(false); // Hem alışkanlıkları hem rozetleri sessizce yenile
    } catch (error) {
        setHabits(originalHabits);
        enqueueSnackbar('Hata: İşlem geri alındı.', { variant: 'error' });
    }
  };

  const handleArchiveHabit = async (habitId: string) => {
    const originalHabits = [...habits];
    setHabits(prevHabits => prevHabits.filter(h => h.id !== habitId));
    enqueueSnackbar('Alışkanlık arşivleniyor...', { variant: 'info' });
    try {
        const token = localStorage.getItem('accessToken');
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        await axios.post(`${apiUrl}/api/Habit/${habitId}/archive`, {}, { headers: { Authorization: `Bearer ${token}` } });
        enqueueSnackbar('Alışkanlık başarıyla arşivlendi.', { variant: 'success' });
    } catch (error) {
        setHabits(originalHabits);
        enqueueSnackbar('Hata: İşlem geri alındı.', { variant: 'error' });
    }
  };
  
  const handleHabitAdded = () => { 
    setIsModalOpen(false); 
    fetchHabitsAndBadges(true); // Yeni alışkanlık eklendiğinde tüm veriyi yenile
  };

 const getBadgesForHabit = (habitName: string) => {
const cleanHabitName = habitName.trim().toLowerCase();
    
    return userBadges.filter(badge => 
        badge.relatedHabitName?.trim().toLowerCase() === cleanHabitName
    );
};

  if (loading) {
    return <Box display="flex" justifyContent="center" alignItems="center" minHeight="calc(100vh - 64px)"><CircularProgress /></Box>;
  }
  
  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>Alışkanlıklarım</Typography>
        <Typography color="text.secondary">Kişisel alışkanlıklarını buradan yönetebilirsin.</Typography>
        <Box sx={{ mt: 4 }}>
            {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}
            <HabitList 
              habits={habits} 
              onToggleHabit={handleToggleHabit} 
              onArchive={handleArchiveHabit}
              getBadgesForHabit={getBadgesForHabit}
            />
        </Box>
      </Box>
      <Fab color="secondary" aria-label="add" sx={{ position: 'fixed', bottom: 32, right: 32 }} onClick={() => setIsModalOpen(true)}>
        <AddIcon />
      </Fab>
      <AddHabitModal open={isModalOpen} onClose={() => setIsModalOpen(false)} onHabitAdded={handleHabitAdded} />
    </Container>
  );
}
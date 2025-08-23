// Dosya: client/src/app/(app)/dashboard/page.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import AddHabitModal from '@/components/AddHabitModal';
import HabitList from '@/components/habits/HabitList';
import ActivityFeed from '@/components/feed/ActivityFeed';
import { Habit, Activity } from '@/types'; 

import { Container, Typography, Box, CircularProgress, Alert, Fab, Divider } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CssBaseline from '@mui/material/CssBaseline';
import { useSnackbar } from 'notistack';

export default function DashboardPage() {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  
  // Alışkanlıklar için state'ler
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Aktivite akışı için state'ler
  const [activities, setActivities] = useState<Activity[]>([]);
  const [feedLoading, setFeedLoading] = useState(true);

  // Modal ve kullanıcı adı için state'ler
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);

  // Alışkanlıkları çeken fonksiyon
  const fetchHabits = useCallback(async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
      return;
    }
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const response = await axios.get(`${apiUrl}/api/Habit`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const todayStr = new Date().toISOString().split('T')[0];
      const habitsWithCompletionStatus = response.data.map((habit: any) => ({
          ...habit,
          isCompletedToday: habit.completions.includes(todayStr)
      }));
      setHabits(habitsWithCompletionStatus);
    } catch (err) {
      setError('Alışkanlıklar yüklenirken bir hata oluştu.');
    }
  }, [router]);
  
  // Aktivite akışını çeken fonksiyon
  const fetchActivityFeed = useCallback(async () => {
    setFeedLoading(true);
    const token = localStorage.getItem('accessToken');
    if (!token) return;
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const response = await axios.get(`${apiUrl}/api/Activity/feed`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setActivities(response.data);
    } catch (err) {
      console.error("Akış verisi yüklenirken hata:", err);
      enqueueSnackbar('Aktivite akışı yüklenirken bir sorun oluştu.', { variant: 'warning' });
    } finally {
      setFeedLoading(false);
    }
  }, [enqueueSnackbar]);


  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
      return;
    }
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUserName(payload.name);
    } catch (e) { console.error("Token ayrıştırılamadı:", e); }
    
    setLoading(true);
    Promise.all([fetchHabits(), fetchActivityFeed()])
      .finally(() => setLoading(false));

  }, [fetchHabits, fetchActivityFeed, router]);

  const handleToggleHabit = async (habitId: string) => {
    const originalHabits = [...habits];
    const updatedHabits = habits.map(habit => 
        habit.id === habitId ? { ...habit, isCompletedToday: !habit.isCompletedToday } : habit
    );
    setHabits(updatedHabits);
    try {
        const token = localStorage.getItem('accessToken');
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        await axios.post(`${apiUrl}/api/Habit/${habitId}/toggle`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
        // Hem alışkanlıkları (streak vs.) hem de akışı tazeleyelim
        await Promise.all([fetchHabits(), fetchActivityFeed()]);
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
        await axios.post(`${apiUrl}/api/Habit/${habitId}/archive`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
        enqueueSnackbar('Alışkanlık başarıyla arşivlendi.', { variant: 'success' });
    } catch (error) {
        setHabits(originalHabits);
        enqueueSnackbar('Hata: İşlem geri alındı.', { variant: 'error' });
    }
  };
  
  const handleHabitAdded = () => {
    setIsModalOpen(false);
    fetchHabits();
  }

  if (loading) {
    return <Box display="flex" justifyContent="center" alignItems="center" minHeight="calc(100vh - 64px)"><CircularProgress /></Box>;
  }
  
  return (
    <>
      <CssBaseline />
      <Container maxWidth="md">
        <Box sx={{ my: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Hoş Geldin, {userName || 'Kullanıcı'}!
          </Typography>

          <Box sx={{ my: 4 }}>
            <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
              Son Aktiviteler
            </Typography>
            <ActivityFeed activities={activities} isLoading={feedLoading} />
          </Box>
          
          <Divider sx={{ my: 4, borderColor: 'grey.300' }} />

          <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
            Alışkanlıklarım
          </Typography>
          {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}
          <HabitList habits={habits} onToggleHabit={handleToggleHabit} onArchive={handleArchiveHabit} />
        </Box>
      </Container>
      
      <Fab color="secondary" aria-label="add" sx={{ position: 'fixed', bottom: 32, right: 32 }} onClick={() => setIsModalOpen(true)}>
        <AddIcon />
      </Fab>
      <AddHabitModal open={isModalOpen} onClose={() => setIsModalOpen(false)} onHabitAdded={handleHabitAdded} />
    </>
  );
}
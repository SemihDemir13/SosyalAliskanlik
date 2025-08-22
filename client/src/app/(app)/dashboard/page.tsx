// Dosya: client/src/app/(app)/dashboard/page.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import AddHabitModal from '@/components/AddHabitModal';
import HabitList from '@/components/habits/HabitList';

import { Container, Typography, Box, CircularProgress, Alert, Fab } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CssBaseline from '@mui/material/CssBaseline';


interface Habit {
   id: string;
   name: string;
   description: string | null;
   createdAt: string;
   completions: string[];
   completionsLastWeek: number; 
   currentStreak: number;
   isCompletedToday: boolean; 
}

export default function DashboardPage() {
  const router = useRouter();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);

  //  sessiz senkronizasyon için 
  const fetchData = useCallback(async (showLoading = false) => {
    if (showLoading) {
      setLoading(true);
    }
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
      setError(null);
    } catch (err) {
      setError('Alışkanlıklar yüklenirken bir hata oluştu.');
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }, [router]);

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

    fetchData(true); // Sayfa ilk yüklendiğinde loading göster
  }, [fetchData, router]);

  const handleToggleHabit = async (habitId: string) => {
    const originalHabits = habits;
    
    // UI'ı anında yeni durumla güncelle
    const updatedHabits = habits.map(habit => 
        habit.id === habitId 
            ? { ...habit, isCompletedToday: !habit.isCompletedToday }
            : habit
    );
    setHabits(updatedHabits);

    // 2. Arka Planda API İsteği Gönderme
    try {
        const token = localStorage.getItem('accessToken');
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        
        await axios.post(`${apiUrl}/api/Habit/${habitId}/toggle`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
        // Başarılı olursa, sunucudaki güncel veriyi sessizce çekerek state'i senkronize et.
        await fetchData(false); 
    } catch (error) {
        console.error("Alışkanlık durumu güncellenemedi:", error);
        // Hata Durumu: Değişikliği geri al
        setHabits(originalHabits);
        setError("Bir hata oluştu, değişiklikleriniz geri alındı.");
    }
  };
  
  const handleHabitAdded = () => {
    setIsModalOpen(false);
    fetchData(true); 
  }

  if (loading) {
    return <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh"><CircularProgress /></Box>;
  }
  
  return (
    <>
      <CssBaseline />
      <Container maxWidth="md">
        <Box sx={{ my: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Hoş Geldin, {userName || 'Kullanıcı'}!
          </Typography>
          
          {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}
          
          <HabitList habits={habits} onToggleHabit={handleToggleHabit} />
        </Box>
      </Container>

      <Fab color="secondary" aria-label="add" sx={{ position: 'fixed', bottom: 32, right: 32 }} onClick={() => setIsModalOpen(true)}>
        <AddIcon />
      </Fab>

      <AddHabitModal 
        open={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onHabitAdded={handleHabitAdded}
      />
    </>
  );
}
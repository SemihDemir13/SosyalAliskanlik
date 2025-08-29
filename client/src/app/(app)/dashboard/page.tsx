// Dosya: client/src/app/(app)/dashboard/page.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import AddHabitModal from '@/components/AddHabitModal';
import HabitList from '@/components/habits/HabitList';
import DeleteConfirmationDialog from '@/components/DeleteConfirmationDialog';
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

  // Silme onayı için state'ler
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [habitToDelete, setHabitToDelete] = useState<{ id: string; name: string } | null>(null);

  const fetchHabitsAndBadges = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
      return;
    }
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const [habitsResponse, badgesResponse] = await Promise.all([
          axios.get(`${apiUrl}/api/Habit`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${apiUrl}/api/Badges/my`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      const todayStr = new Date().toISOString().split('T')[0];
      const habitsWithCompletionStatus = habitsResponse.data.map((habit: any) => ({
          ...habit,
          isCompletedToday: habit.completions.includes(todayStr)
      }));
      setHabits(habitsWithCompletionStatus);
      
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
        await fetchHabitsAndBadges(false);
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
    fetchHabitsAndBadges(true);
  };

  const getBadgesForHabit = (habitName: string) => {
    const cleanHabitName = habitName.trim().toLowerCase();
    return userBadges.filter(badge => 
        badge.relatedHabitName?.trim().toLowerCase() === cleanHabitName
    );
  };

  const handleOpenDeleteDialog = (habitId: string, habitName: string) => {
    setHabitToDelete({ id: habitId, name: habitName });
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setHabitToDelete(null);
    setDeleteDialogOpen(false);
  };

  const handleDeleteHabit = async () => {
    if (!habitToDelete) return;

    const originalHabits = [...habits];
    setHabits(prevHabits => prevHabits.filter(h => h.id !== habitToDelete.id));
    handleCloseDeleteDialog();
    enqueueSnackbar(`'${habitToDelete.name}' alışkanlığı siliniyor...`, { variant: 'info' });

    try {
        const token = localStorage.getItem('accessToken');
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        await axios.delete(`${apiUrl}/api/Habit/${habitToDelete.id}`, { headers: { Authorization: `Bearer ${token}` } });
        enqueueSnackbar('Alışkanlık başarıyla silindi.', { variant: 'success' });
    } catch (error) {
        setHabits(originalHabits);
        enqueueSnackbar('Hata: Silme işlemi geri alındı.', { variant: 'error' });
    }
  };

  if (loading) {
    return <Box display="flex" justifyContent="center" alignItems="center" minHeight="calc(100vh - 64px)"><CircularProgress /></Box>;
  }
  
  return (
    <>
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
                onDelete={handleOpenDeleteDialog}
                getBadgesForHabit={getBadgesForHabit}
              />
          </Box>
        </Box>
      </Container>
      
      <Fab color="secondary" aria-label="add" sx={{ position: 'fixed', bottom: 32, right: 32 }} onClick={() => setIsModalOpen(true)}>
        <AddIcon />
      </Fab>
      
      <AddHabitModal open={isModalOpen} onClose={() => setIsModalOpen(false)} onHabitAdded={handleHabitAdded} />
      
      <DeleteConfirmationDialog 
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleDeleteHabit}
        title="Alışkanlığı Sil"
        description={`'${habitToDelete?.name || ''}' alışkanlığını kalıcı olarak silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`}
      />
    </>
  );
}
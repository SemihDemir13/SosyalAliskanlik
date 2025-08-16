// Dosya: client/src/app/(app)/dashboard/page.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import AddHabitModal from '@/components/AddHabitModal'; // AddHabitModal'ı kullanacağız
import HabitList from '@/components/habits/HabitList'; // Sadeleşmiş HabitList'i kullanacağız

import { Container, Typography, Box, CircularProgress, Alert, Fab } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CssBaseline from '@mui/material/CssBaseline';

// Sadeleştirilmiş Habit tipi
interface Habit {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  completions: string[]; // Bu, checkbox için hala gerekli
}

export default function DashboardPage() {
  const router = useRouter();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const token = localStorage.getItem('accessToken');

    if (!token) {
      router.push('/login');
      return;
    }

    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUserName(payload.name);
    } catch (e) {
        console.error("Token ayrıştırılamadı:", e);
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const response = await axios.get(`${apiUrl}/api/Habit`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHabits(response.data);
    } catch (err) {
      setError('Alışkanlıklar yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
          
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          
          <HabitList habits={habits} onHabitUpdated={fetchData} />
        </Box>
      </Container>

      <Fab color="secondary" aria-label="add" sx={{ position: 'fixed', bottom: 32, right: 32 }} onClick={() => setIsModalOpen(true)}>
        <AddIcon />
      </Fab>

      <AddHabitModal 
        open={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onHabitAdded={fetchData}
      />
    </>
  );
}
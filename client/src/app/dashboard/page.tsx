// Dosya: client/src/app/dashboard/page.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import AddHabitModal from '@/components/AddHabitModal';

// MUI Bileşenleri
import { Container, Typography, Box, CircularProgress, Alert, List, ListItem, ListItemText, Fab, Paper, Divider } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CssBaseline from '@mui/material/CssBaseline'; // Koyu tema arkaplanı için

// Alışkanlık verisinin tip tanımı
interface Habit {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);

  const fetchHabits = useCallback(async (token: string) => {
    setLoading(true);
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
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
      return;
    }
    
    // Token'dan kullanıcı adını ayrıştırma (basit yöntem)
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUserName(payload.name);
    } catch (e) {
        console.error("Token ayrıştırılamadı:", e);
    }

    fetchHabits(token);
  }, [router, fetchHabits]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <>
      <CssBaseline /> {/* Koyu tema için arkaplan rengini uygular */}
      <Container maxWidth="md">
        <Box sx={{ my: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Hoş Geldin, {userName || 'Kullanıcı'}!
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
            İşte bugünkü alışkanlıkların.
          </Typography>
          
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          
          <Paper elevation={3}>
            {habits.length > 0 ? (
              <List>
                {habits.map((habit, index) => (
                  <div key={habit.id}>
                    <ListItem>
                      <ListItemText 
                        primary={habit.name} 
                        secondary={habit.description || 'Açıklama yok'} 
                      />
                      {/* TODO: Alışkanlık tamamlama butonu buraya gelecek */}
                    </ListItem>
                    {index < habits.length - 1 && <Divider />}
                  </div>
                ))}
              </List>
            ) : (
              <Typography sx={{ p: 3, textAlign: 'center' }}>
                Henüz bir alışkanlık eklemedin. Başlamak için sağ alttaki '+' butonuna tıkla!
              </Typography>
            )}
          </Paper>
        </Box>
      </Container>

      <Fab color="secondary" aria-label="add" sx={{ position: 'fixed', bottom: 32, right: 32 }} onClick={() => setIsModalOpen(true)}>
        <AddIcon />
      </Fab>

      <AddHabitModal 
        open={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onHabitAdded={() => {
          const token = localStorage.getItem('accessToken');
          if (token) fetchHabits(token);
        }}
      />
    </>
  );
}
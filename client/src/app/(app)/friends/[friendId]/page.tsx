// Dosya: client/src/app/(app)/friends/[friendId]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';


import { Container, Typography, Box, CircularProgress, Alert, Paper, List, ListItem, ListItemText, Divider } from '@mui/material';


interface HabitSummary {
  id: string;
  name: string;
  completionsLastWeek: number;
}

interface UserHabitSummary {
  userName: string;
  habits: HabitSummary[];
}

export default function FriendDetailPage() {
  const params = useParams(); // URL'den parametreleri almak için hook
  const friendId = params.friendId; // [friendId] klasör adıyla eşleşir

  const [summary, setSummary] = useState<UserHabitSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // friendId'nin bir dizi olma ihtimaline karşı ilk elemanı alıyoruz.
    const id = Array.isArray(friendId) ? friendId[0] : friendId;

    if (!id) {
      setLoading(false);
      setError("Arkadaş ID'si bulunamadı.");
      return;
    }

    const fetchSummary = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const response = await axios.get(`${apiUrl}/api/users/${id}/habits/summary`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSummary(response.data);
      } catch (err: any) {
        if (axios.isAxiosError(err) && err.response?.status === 403) {
          setError("Bu kullanıcının bilgilerini görme yetkiniz yok. Arkadaş olduğunuzdan emin olun.");
        } else {
          setError("Veriler yüklenirken bir hata oluştu.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [friendId]);

  if (loading) {
    return <Box display="flex" justifyContent="center" sx={{ mt: 4 }}><CircularProgress /></Box>;
  }

  if (error) {
    return <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>;
  }

  if (!summary) {
    return <Typography>Arkadaş bilgisi bulunamadı.</Typography>
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {summary.userName}'in Alışkanlık Özeti
      </Typography>

      <Paper elevation={3} sx={{ mt: 3 }}>
        {summary.habits.length > 0 ? (
          <List>
            {summary.habits.map((habit, index) => (
              <div key={habit.id}>
                <ListItem>
                  <ListItemText 
                    primary={habit.name}
                    secondary={`Son 7 günde ${habit.completionsLastWeek} kez tamamlandı.`}
                  />
                </ListItem>
                {index < summary.habits.length - 1 && <Divider />}
              </div>
            ))}
          </List>
        ) : (
          <Typography sx={{ p: 3, textAlign: 'center' }}>
            {summary.userName} henüz hiç alışkanlık eklememiş.
          </Typography>
        )}
      </Paper>
    </Box>
  );
}
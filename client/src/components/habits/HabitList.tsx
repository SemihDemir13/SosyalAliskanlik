// Dosya: client/src/components/habits/HabitList.tsx
'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { List, ListItem, ListItemText, Typography, Paper, Divider, Checkbox,Box } from '@mui/material';
import { useSnackbar } from 'notistack';
import HabitCard from './HabitCard';

// Tipler
interface Habit {
  id: string;
  name: string;
  description: string | null;
  completions: string[];
}

interface HabitListProps {
  habits: Habit[];
  onHabitUpdated: () => void;
}

// Yardımcı fonksiyon
const getTodayDateString = () => new Date().toISOString().split('T')[0];

export default function HabitList({ habits, onHabitUpdated }: HabitListProps) {
  const { enqueueSnackbar } = useSnackbar();
  const [completions, setCompletions] = useState<Set<string>>(new Set());

  // Bu useEffect, Dashboard'dan gelen 'habits' prop'u her değiştiğinde çalışır.
  // Bu, checkbox'ların durumunun her zaman en güncel veriyle senkronize olmasını sağlar.
  useEffect(() => {
    const today = getTodayDateString();
    const initialCompletions = new Set<string>();

    // Güvenlik Kontrolü: 'habits'in bir dizi olduğundan emin ol.
    // Bu, "Cannot read properties of undefined (reading 'forEach')" hatasını önler.
    if (Array.isArray(habits)) {
      habits.forEach(habit => {
        // habit.completions'ın da var olduğunu kontrol et
        if (habit.completions && habit.completions.includes(today)) {
          initialCompletions.add(habit.id);
        }
      });
    }
    setCompletions(initialCompletions);
  }, [habits]); // Bu efekt, 'habits' prop'u değiştiğinde yeniden çalışır.

  // Checkbox'a tıklandığında çalışacak olan fonksiyon
  const handleToggleCompletion = async (habitId: string) => {
    const token = localStorage.getItem('accessToken');
    const today = getTodayDateString();
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const isCurrentlyCompleted = completions.has(habitId);

    // İyimser Arayüz Güncellemesi
    const newCompletions = new Set(completions);
    if (isCurrentlyCompleted) {
      newCompletions.delete(habitId);
    } else {
      newCompletions.add(habitId);
    }
    setCompletions(newCompletions);

    try {
      if (isCurrentlyCompleted) {
        await axios.delete(`${apiUrl}/api/Habit/${habitId}/completions/${today}`, { headers: { Authorization: `Bearer ${token}` } });
      } else {
        await axios.post(`${apiUrl}/api/Habit/${habitId}/completions`, { completionDate: today }, { headers: { Authorization: `Bearer ${token}` } });
      }
      onHabitUpdated(); // Başarılı olursa, Dashboard'a haber vererek tüm veriyi güncellemesini sağla.
    } catch (error) {
      console.error("Tamamlama durumu güncellenirken hata oluştu:", error);
      // Hata durumunda, iyimser güncellemeyi geri al.
      setCompletions(completions); 
      enqueueSnackbar('Bir hata oluştu. Lütfen tekrar deneyin.', { variant: 'error' });
    }
  };

  if (!habits || habits.length === 0) {
    return (
      <Paper elevation={3}>
        <Typography sx={{ p: 3, textAlign: 'center' }}>
          Henüz bir alışkanlık eklemedin.
        </Typography>
      </Paper>
    );
  }

    return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', // Responsive grid
        gap: 3, // Kartlar arası boşluk
      }}
    >
      {habits.map((habit) => (
        <HabitCard
          key={habit.id}
          habit={habit}
          isCompletedToday={completions.has(habit.id)}
          onToggleCompletion={handleToggleCompletion}
        />
      ))}
    </Box>
  );
}
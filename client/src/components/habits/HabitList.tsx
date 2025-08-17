'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Typography, Paper, Box } from '@mui/material';
import { useSnackbar } from 'notistack';
import HabitCard from './HabitCard'; 

interface Habit {
  id: string; name: string; description: string | null; completions: string[];
  completionsLastWeek: number; currentStreak: number;
}
interface HabitListProps { habits: Habit[]; onHabitUpdated: () => void; }
const getTodayDateString = () => new Date().toISOString().split('T')[0];

export default function HabitList({ habits, onHabitUpdated }: HabitListProps) {
  const { enqueueSnackbar } = useSnackbar();
  const [completions, setCompletions] = useState<Set<string>>(new Set());
  useEffect(() => {
    const today = getTodayDateString();
    const newCompletions = new Set<string>();
    if (Array.isArray(habits)) {
      habits.forEach(habit => {
        if (habit.completions && habit.completions.includes(today)) {
          newCompletions.add(habit.id);
        }
      });
    }
    setCompletions(newCompletions);
  }, [habits]);
  const handleToggleCompletion = async (habitId: string) => {
    const token = localStorage.getItem('accessToken');
    const today = getTodayDateString();
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const isCurrentlyCompleted = completions.has(habitId);
    const oldCompletions = new Set(completions);
    setCompletions(prev => {
      const newCompletions = new Set(prev);
      if (isCurrentlyCompleted) newCompletions.delete(habitId);
      else newCompletions.add(habitId);
      return newCompletions;
    });
    try {
      if (isCurrentlyCompleted) {
        await axios.delete(`${apiUrl}/api/Habit/${habitId}/completions/${today}`, { headers: { Authorization: `Bearer ${token}` } });
      } else {
        await axios.post(`${apiUrl}/api/Habit/${habitId}/completions`, { completionDate: today }, { headers: { Authorization: `Bearer ${token}` } });
      }
      onHabitUpdated();
    } catch (error) {
      setCompletions(oldCompletions);
      enqueueSnackbar('Bir hata oluştu.', { variant: 'error' });
    }
  };
  if (!habits || habits.length === 0) {
    return <Paper elevation={0} variant="outlined" sx={{ p: 3, textAlign: 'center' }}><Typography>Henüz bir alışkanlık eklemedin.</Typography></Paper>;
  }
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 3 }}>
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
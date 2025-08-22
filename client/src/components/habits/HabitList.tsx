// Dosya: client/src/components/habits/HabitList.tsx
'use client';

import HabitCard from './HabitCard'; 
import { Box, Typography, Paper } from '@mui/material';

// Dashboard'dan gelen tam Habit tipini kullanıyoruz
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

interface HabitListProps { 
  habits: Habit[]; 
  onToggleHabit: (habitId: string) => void; 
}

export default function HabitList({ habits, onToggleHabit }: HabitListProps) {
  if (!habits || habits.length === 0) {
    return (
      <Paper elevation={0} variant="outlined" sx={{ p: 3, textAlign: 'center' }}>
        <Typography>Henüz bir alışkanlık eklemedin.</Typography>
      </Paper>
    );
  }

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 3 }}>
      {habits.map((habit) => (
        <HabitCard
          key={habit.id}
          habit={habit}
          onToggleCompletion={onToggleHabit} // Gelen prop'u doğrudan pasla
        />
      ))}
    </Box>
  );
}
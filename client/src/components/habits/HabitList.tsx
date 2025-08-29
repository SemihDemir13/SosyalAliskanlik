// Dosya: client/src/components/habits/HabitList.tsx
'use client';

import HabitCard from './HabitCard'; 
import { Box, Typography, Paper } from '@mui/material';
import { Habit, Badge } from '@/types';

interface HabitListProps { 
  habits: Habit[]; 
  onToggleHabit: (habitId: string) => void; 
  onArchive: (habitId: string) => void;
  onDelete?: (habitId: string, habitName: string) => void; // Bu prop artık opsiyonel
  isArchivePage?: boolean;
  getBadgesForHabit?: (habitName: string) => Badge[];
}

export default function HabitList({ habits, onToggleHabit, onArchive, onDelete, isArchivePage = false, getBadgesForHabit }: HabitListProps) {
  if (!habits || habits.length === 0) {
    return (
      <Paper elevation={0} variant="outlined" sx={{ p: 3, textAlign: 'center' }}>
        <Typography>
          {isArchivePage ? 'Arşivlenmiş bir alışkanlık bulunmuyor.' : 'Henüz bir alışkanlık eklemedin.'}
        </Typography>
      </Paper>
    );
  }

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 3 }}>
      {habits.map((habit) => (
        <HabitCard
          key={habit.id}
          habit={habit}
          onToggleCompletion={onToggleHabit}
          onArchive={onArchive}
          // onDelete prop'u varsa HabitCard'a ilet, yoksa hiçbir şey yapmayan boş bir fonksiyon ilet.
          // Bu, ProfilePage gibi onDelete'i kullanmayan yerlerde kodun çökmesini engeller.
          onDelete={onDelete || (() => {})}
          isArchivePage={isArchivePage}
          badges={getBadgesForHabit ? getBadgesForHabit(habit.name) : []}
        />
      ))}
    </Box>
  );
}
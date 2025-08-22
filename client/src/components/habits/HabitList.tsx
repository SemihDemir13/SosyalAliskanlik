// Dosya: client/src/components/habits/HabitList.tsx
'use client';

import HabitCard from './HabitCard'; 
import { Box, Typography, Paper } from '@mui/material';
import { Habit } from '@/types'; // Merkezi tip tanımını kullan

interface HabitListProps { 
  habits: Habit[]; 
  onToggleHabit: (habitId: string) => void; 
  onArchive: (habitId: string) => void; // Prop ismini onArchive olarak standartlaştırdık
  isArchivePage?: boolean; // Bu sayfanın arşiv sayfası olup olmadığını belirtir (opsiyonel)
}

export default function HabitList({ habits, onToggleHabit, onArchive, isArchivePage = false }: HabitListProps) {
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
          onArchive={onArchive} // onArchive prop'unu HabitCard'a iletiyoruz
          isArchivePage={isArchivePage} // Bilgiyi HabitCard'a aktarıyoruz
        />
      ))}
    </Box>
  );
}
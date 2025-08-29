// Dosya: client/src/components/habits/HabitList.tsx
'use client';

import HabitCard from './HabitCard'; 
import { Box, Typography, Paper } from '@mui/material';
import { Habit, Badge } from '@/types';

interface HabitListProps { 
  habits: Habit[]; 
  onToggleHabit: (habitId: string) => void; 
  onArchive: (habitId: string) => void;
  isArchivePage?: boolean;
  getBadgesForHabit?: (habitName: string) => Badge[]; // Dashboard'dan gelecek, opsiyonel
}

export default function HabitList({ habits, onToggleHabit, onArchive, isArchivePage = false, getBadgesForHabit }: HabitListProps) {
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
          isArchivePage={isArchivePage}
          // O anki alışkanlığa ait rozetleri bulup HabitCard'a gönderiyoruz.
          // Eğer getBadgesForHabit fonksiyonu yoksa (profil sayfasındaki gibi), boş dizi gönder.
          badges={getBadgesForHabit ? getBadgesForHabit(habit.name) : []}
        />
      ))}
    </Box>
  );
}
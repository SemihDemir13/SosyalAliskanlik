// Dosya: client/src/components/habits/HabitCard.tsx
'use client';

import { Card, CardContent, Typography, Box, Checkbox, Tooltip } from '@mui/material';
import { CheckCircleOutline } from '@mui/icons-material';

// Tipler
interface Habit {
  id: string;
  name: string;
  description: string | null;
}

interface HabitCardProps {
  habit: Habit;
  isCompletedToday: boolean;
  onToggleCompletion: (habitId: string) => void;
}

export default function HabitCard({ habit, isCompletedToday, onToggleCompletion }: HabitCardProps) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
          <Box>
            <Typography variant="h5" component="div">
              {habit.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {habit.description || 'Açıklama yok.'}
            </Typography>
          </Box>
          <Checkbox
            checked={isCompletedToday}
           
            color="success"
            sx={{
                
                transform: 'scale(1.2)',
            }}
          />
        </Box>
        {/* TODO: İstatistikler (Seri, Haftalık) buraya eklenecek */}
      </CardContent>
    </Card>
  );
}
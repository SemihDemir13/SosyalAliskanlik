// Dosya: client/src/components/habits/HabitCard.tsx
'use client';

import Link from 'next/link';
import { Card, CardContent, Typography, Box, Checkbox, Tooltip, Link as MuiLink } from '@mui/material';
import { LocalFireDepartment } from '@mui/icons-material';

// Dashboard'dan gelen tam Habit tipini kullanıyoruz
interface Habit {
    id: string;
    name: string;
    description: string | null;
    completionsLastWeek: number;
    currentStreak: number;
    isCompletedToday: boolean; // Bu alan artık habit nesnesinin bir parçası
}

interface HabitCardProps {
    habit: Habit;
    onToggleCompletion: (habitId: string) => void;
}

export default function HabitCard({ habit, onToggleCompletion }: HabitCardProps) {
    return (
        <MuiLink component={Link} href={`/habits/${habit.id}`} underline="none" color="inherit">
            <Card sx={{ height: '100%', '&:hover': { boxShadow: 6 } }}>
                <CardContent sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', flexGrow: 1 }}>
                        <Box>
                            <Typography variant="h5" component="div">{habit.name}</Typography>
                            <Typography variant="body2" color="text.secondary">{habit.description || 'Açıklama yok.'}</Typography>
                        </Box>
                        <Checkbox
                            checked={habit.isCompletedToday} // Doğrudan habit nesnesinden oku
                            onClick={(event) => {
                                event.preventDefault(); // ÖNEMLİ: Link'e tıklamayı engeller
                                event.stopPropagation(); // Diğer olayların tetiklenmesini durdurur
                                onToggleCompletion(habit.id);
                            }}
                            color="success"
                            sx={{ p: 0, ml: 1 }}
                        />
                    </Box>
                    <Box sx={{ pt: 2, display: 'flex', justifyContent: 'space-around', borderTop: 1, borderColor: 'divider' }}>
                        <Tooltip title="Mevcut Seri">
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <LocalFireDepartment color={habit.currentStreak > 0 ? "error" : "disabled"} />
                                <Typography variant="h6">{habit.currentStreak}</Typography>
                            </Box>
                        </Tooltip>
                        <Tooltip title="Son 7 Gün">
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="body2">Haftalık:</Typography>
                                <Typography variant="h6">{habit.completionsLastWeek}</Typography>
                            </Box>
                        </Tooltip>
                    </Box>
                </CardContent>
            </Card>
        </MuiLink>
    );
}
'use client';
import { Card, CardContent, Typography, Box, Checkbox, Tooltip, Link as MuiLink } from '@mui/material';
import { LocalFireDepartment, CheckCircleOutline } from '@mui/icons-material';
import Link from 'next/link';

interface Habit {
    id: string; name: string; description: string | null;
    completionsLastWeek: number; currentStreak: number;
}
interface HabitCardProps {
    habit: Habit; isCompletedToday: boolean; onToggleCompletion: (habitId: string) => void;
}
export default function HabitCard({ habit, isCompletedToday, onToggleCompletion }: HabitCardProps) {
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
                            checked={isCompletedToday}
                            onClick={(event) => {
                                event.stopPropagation();
                                onToggleCompletion(habit.id);
                            }}
                           
                            color="success"
                            sx={{ p: 0, ml: 1 }}
                        />
                    </Box>
                    <Box sx={{ pt: 2, display: 'flex', justifyContent: 'space-around', borderTop: 1, borderColor: 'divider' }}>
                        <Tooltip title="Mevcut Seri"><Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LocalFireDepartment color={habit.currentStreak > 0 ? "error" : "disabled"} />
                            <Typography variant="h6">{habit.currentStreak}</Typography>
                        </Box></Tooltip>
                        <Tooltip title="Son 7 Gün"><Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2">Haftalık:</Typography>
                            <Typography variant="h6">{habit.completionsLastWeek}</Typography>
                        </Box></Tooltip>
                    </Box>
                </CardContent>
            </Card>
        </MuiLink>
    );
}
// Dosya: client/src/components/habits/HabitCard.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
    Card, 
    CardContent, 
    Typography, 
    Box, 
    Checkbox, 
    Tooltip, 
    Link as MuiLink, 
    IconButton, 
    Menu, 
    MenuItem,
    ListItemIcon,
    ListItemText
} from '@mui/material';
import { 
    LocalFireDepartment, 
    MoreVert as MoreVertIcon, 
    Archive as ArchiveIcon,
    Unarchive as UnarchiveIcon
} from '@mui/icons-material'; // HATA DÜZELTİLDİ: 'G' harfi kaldırıldı
import { Habit } from '@/types';

interface HabitCardProps {
    habit: Habit;
    onToggleCompletion: (habitId: string) => void;
    onArchive: (habitId: string) => void;
    isArchivePage?: boolean;
}

export default function HabitCard({ habit, onToggleCompletion, onArchive, isArchivePage = false }: HabitCardProps) {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const isMenuOpen = Boolean(anchorEl);

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleArchiveOrUnarchiveClick = (event: React.MouseEvent<HTMLElement>) => {
        event.preventDefault();
        event.stopPropagation();
        onArchive(habit.id);
        handleMenuClose();
    };

    return (
        <MuiLink component={Link} href={`/habits/${habit.id}`} underline="none" color="inherit" sx={{ textDecoration: 'none' }}>
            <Card sx={{ 
                height: '100%', 
                display: 'flex',
                flexDirection: 'column',
                transition: 'box-shadow 0.3s',
                '&:hover': { boxShadow: 6, cursor: 'pointer' } 
            }}>
                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box sx={{ pr: 1, overflow: 'hidden' }}>
                            <Typography variant="h6" component="div" noWrap title={habit.name}>{habit.name}</Typography>
                            <Typography variant="body2" color="text.secondary" noWrap title={habit.description || ''}>{habit.description || 'Açıklama yok.'}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Tooltip title={habit.isCompletedToday ? "Geri Al" : "Tamamla"}>
                                <Checkbox
                                    checked={habit.isCompletedToday}
                                    onClick={(event) => {
                                        event.preventDefault();
                                        event.stopPropagation();
                                        onToggleCompletion(habit.id);
                                    }}
                                    color="success"
                                    sx={{ p: 0.5, opacity: isArchivePage ? 0.5 : 1, pointerEvents: isArchivePage ? 'none' : 'auto' }}
                                    disabled={isArchivePage}
                                />
                            </Tooltip>
                            <Tooltip title="Seçenekler">
                                <IconButton aria-label="seçenekler" onClick={handleMenuOpen} sx={{ p: 0.5 }}>
                                    <MoreVertIcon />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    </Box>
                    <Box sx={{ flexGrow: 1 }} />
                    <Box sx={{ pt: 2, mt: 2, display: 'flex', justifyContent: 'space-around', borderTop: 1, borderColor: 'divider' }}>
                         <Tooltip title="Mevcut Seri">
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <LocalFireDepartment color={habit.currentStreak > 0 ? "error" : "disabled"} />
                                <Typography variant="body1" fontWeight="bold">{habit.currentStreak}</Typography>
                            </Box>
                        </Tooltip>
                        <Tooltip title="Son 7 Gündeki Tamamlama Sayısı">
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Typography variant="body2">Haftalık:</Typography>
                                <Typography variant="body1" fontWeight="bold">{habit.completionsLastWeek}</Typography>
                            </Box>
                        </Tooltip>
                    </Box>
                </CardContent>
            </Card>

            <Menu
                anchorEl={anchorEl}
                open={isMenuOpen}
                onClose={handleMenuClose}
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
            >
                <MenuItem onClick={handleArchiveOrUnarchiveClick}>
                    {isArchivePage ? (
                        <>
                            <ListItemIcon><UnarchiveIcon fontSize="small" /></ListItemIcon>
                            <ListItemText>Arşivden Çıkar</ListItemText>
                        </>
                    ) : (
                        <>
                            <ListItemIcon><ArchiveIcon fontSize="small" /></ListItemIcon>
                            <ListItemText>Arşivle</ListItemText>
                        </>
                    )}
                </MenuItem>
            </Menu>
        </MuiLink>
    );
}
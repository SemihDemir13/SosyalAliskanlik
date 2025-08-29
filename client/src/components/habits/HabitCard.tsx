// Dosya: client/src/components/habits/HabitCard.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, Typography, Box, Checkbox, Tooltip, Link as MuiLink, IconButton, Menu, MenuItem, ListItemIcon, ListItemText, Divider } from '@mui/material';
import { LocalFireDepartment, MoreVert as MoreVertIcon, Archive as ArchiveIcon, Unarchive as UnarchiveIcon, EmojiEvents as BadgeIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { Habit, Badge } from '@/types';

interface HabitCardProps {
    habit: Habit;
    onToggleCompletion: (habitId: string) => void;
    onArchive: (habitId: string) => void;
    onDelete: (habitId: string, habitName: string) => void;
    isArchivePage?: boolean;
    badges: Badge[]; 
}

export default function HabitCard({ habit, onToggleCompletion, onArchive, onDelete, isArchivePage = false, badges }: HabitCardProps) {
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

    const handleDeleteClick = (event: React.MouseEvent<HTMLElement>) => {
        event.preventDefault();
        event.stopPropagation();
        onDelete(habit.id, habit.name);
        handleMenuClose();
    };

    return (
        <MuiLink component={Link} href={`/habits/${habit.id}`} underline="none" color="inherit" sx={{ textDecoration: 'none' }}>
            <Card sx={{ 
                position: 'relative', 
                height: '100%', 
                display: 'flex',
                flexDirection: 'column',
                transition: 'box-shadow 0.3s',
                '&:hover': { boxShadow: 6, cursor: 'pointer' } 
            }}>
                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 2, pb: badges.length > 0 ? 6 : 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', flexGrow: 1 }}>
                        <Box>
                            <Typography variant="h5" component="div">{habit.name}</Typography>
                            <Typography variant="body2" color="text.secondary">{habit.description || 'Açıklama yok.'}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Checkbox
                                checked={habit.isCompletedToday}
                                onClick={(event) => {
                                    event.preventDefault();
                                    event.stopPropagation();
                                    onToggleCompletion(habit.id);
                                }}
                                color="success"
                                sx={{ p: 0.5 }}
                                disabled={isArchivePage}
                            />
                            <IconButton aria-label="seçenekler" onClick={handleMenuOpen} sx={{ p: 0.5 }}>
                                <MoreVertIcon />
                            </IconButton>
                        </Box>
                    </Box>

                    <Box sx={{ pt: 2, mt: 'auto', display: 'flex', justifyContent: 'space-around', alignItems: 'center', borderTop: 1, borderColor: 'divider' }}>
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
                
                {badges && badges.length > 0 && (
                    <Box sx={{ position: 'absolute', bottom: 8, right: 8, display: 'flex', flexDirection: 'row-reverse', gap: 0.5, zIndex: 1 }}>
                        {badges.map((badge) => (
                            <Tooltip key={badge.id} title={`${badge.name}: ${badge.description}`}>
                                <Box component="img" src={badge.iconUrl} alt={badge.name} sx={{ width: 28, height: 28, filter: 'drop-shadow(0px 1px 1px rgba(0,0,0,0.4))' }} />
                            </Tooltip>
                        ))}
                    </Box>
                )}
            </Card>

            <Menu anchorEl={anchorEl} open={isMenuOpen} onClose={handleMenuClose} onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                <MenuItem onClick={handleArchiveOrUnarchiveClick}>
                    {isArchivePage ? (
                        <><ListItemIcon><UnarchiveIcon fontSize="small" /></ListItemIcon><ListItemText>Arşivden Çıkar</ListItemText></>
                    ) : (
                        <><ListItemIcon><ArchiveIcon fontSize="small" /></ListItemIcon><ListItemText>Arşivle</ListItemText></>
                    )}
                </MenuItem>
                
                {!isArchivePage && <Divider />}
                {!isArchivePage && (
                    <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
                        <ListItemIcon><DeleteIcon fontSize="small" sx={{ color: 'error.main' }} /></ListItemIcon>
                        <ListItemText>Sil</ListItemText>
                    </MenuItem>
                )}
            </Menu>
        </MuiLink>
    );
}
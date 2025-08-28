'use client';
import { Box, CircularProgress, Typography } from '@mui/material';
import BadgeItem from './BadgeItem';
import { Badge } from '@/types';

interface BadgeListProps {
    badges: Badge[];
    isLoading: boolean;
}

export default function BadgeList({ badges, isLoading }: BadgeListProps) {
    if (isLoading) {
        return <Box display="flex" justifyContent="center" my={2}><CircularProgress size={24} /></Box>;
    }

    if (badges.length === 0) {
        return (
            <Typography color="text.secondary" my={2}>
                Henüz kazanılmış bir rozet yok.
            </Typography>
        );
    }

    return (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2 }}>
            {badges.map((badge) => (
                <BadgeItem key={badge.id} badge={badge} />
            ))}
        </Box>
    );
}
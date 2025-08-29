// Dosya: client/src/components/badges/BadgeItem.tsx
'use client';

import { Box, Paper, Tooltip, Typography } from '@mui/material';
import Image from 'next/image';
import { Badge } from '@/types';

interface BadgeItemProps {
    badge: Badge;
}

export default function BadgeItem({ badge }: BadgeItemProps) {
    
    const tooltipTitle = badge.relatedHabitName 
        ? `${badge.name} ('${badge.relatedHabitName}' alışkanlığı ile kazanıldı): ${badge.description}`
        : `${badge.name}: ${badge.description}`;

    return (
        <Tooltip title={tooltipTitle} arrow>
            <Paper 
                elevation={2} 
                sx={{ 
                    p: 1, 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    width: 100,
                    height: 100,
                    transition: 'transform 0.2s',
                    '&:hover': {
                        transform: 'scale(1.05)'
                    }
                }}
            >
                <Image 
                    src={badge.iconUrl} 
                    alt={badge.name}
                    width={50}
                    height={50}
                />
                <Typography variant="caption" align="center" sx={{ mt: 1, fontWeight: 'bold' }}>
                    {badge.name}
                </Typography>
            </Paper>
        </Tooltip>
    );
}
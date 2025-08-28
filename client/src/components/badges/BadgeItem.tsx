'use client';
import { Box, Paper, Tooltip, Typography } from '@mui/material';
import Image from 'next/image'; 
import { Badge } from '@/types';

interface BadgeItemProps {
    badge: Badge;
}

export default function BadgeItem({ badge }: BadgeItemProps) {
     const tooltipTitle = badge.relatedHabitName 
        ? `${badge.name} (${badge.relatedHabitName}): ${badge.description}`
        : `${badge.name}: ${badge.description}`;
        
    return (
        <Tooltip title={`${badge.name}: ${badge.description}`} arrow>
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
                    // Not: Eğer rozet ikonları dış bir kaynaktan geliyorsa,
                    // next.config.js'de domain'i belirtmek gerekebilir.
                    // Şimdilik public klasöründe olduğunu varsayıyoruz.
                />
                <Typography variant="caption" align="center" sx={{ mt: 1, fontWeight: 'bold' }}>
                    {badge.name}
                </Typography>
            </Paper>
        </Tooltip>
    );
}
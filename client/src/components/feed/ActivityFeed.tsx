'use client';
import { Box, Typography, Stack, CircularProgress } from '@mui/material';
import ActivityItem from './ActivityItem';
import { Activity } from '@/types'; 

interface ActivityFeedProps {
    activities: Activity[];
    isLoading: boolean;
}

export default function ActivityFeed({ activities, isLoading }: ActivityFeedProps) {
    if (isLoading) {
        return <Box display="flex" justifyContent="center" my={4}><CircularProgress /></Box>;
    }

    if (activities.length === 0) {
        return (
            <Typography color="text.secondary" textAlign="center" my={4}>
                Henüz görüntülenecek bir aktivite yok.
            </Typography>
        );
    }

    return (
        <Stack spacing={2}>
            {activities.map((activity) => (
                <ActivityItem
                    key={activity.id}
                    userName={activity.userName}
                    description={activity.description}
                    createdAt={activity.createdAt}
                />
            ))}
        </Stack>
    );
}
'use client';
import { Avatar, Box, Paper, Typography } from '@mui/material';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale'; 

interface ActivityItemProps {
    userName: string;
    description: string;
    createdAt: string;
}

function stringToColor(string: string) {
  let hash = 0;
  for (let i = 0; i < string.length; i += 1) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = '#';
  for (let i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }
  return color;
}

export default function ActivityItem({ userName, description, createdAt }: ActivityItemProps) {
    const timeAgo = formatDistanceToNow(new Date(createdAt), { addSuffix: true, locale: tr });
    const avatarColor = stringToColor(userName);

    return (
        <Paper variant="outlined" sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: avatarColor, width: 40, height: 40 }}>
                {userName.charAt(0).toUpperCase()}
            </Avatar>
            <Box>
                <Typography variant="body1">{description}</Typography>
                <Typography variant="caption" color="text.secondary">
                    {timeAgo}
                </Typography>
            </Box>
        </Paper>
    );
}
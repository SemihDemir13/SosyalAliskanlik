// Dosya: client/src/components/messaging/MessageBubble.tsx
'use client';

import { Box, Paper, Typography } from '@mui/material';
import { MessageDto } from '@/types';

interface MessageBubbleProps {
  message: MessageDto;
  isOwnMessage: boolean;
}

export default function MessageBubble({ message, isOwnMessage }: MessageBubbleProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
        mb: 1,
      }}
    >
      <Paper
        variant="elevation"
        sx={{
          p: 1.5,
          backgroundColor: isOwnMessage ? 'primary.main' : '#E5E5EA',
         backgroundImage: isOwnMessage 
            ? 'linear-gradient(45deg, #007BFF 30%, #5856D6 90%)' 
            : 'none',
          color: isOwnMessage ? 'white' : 'black', 
          borderRadius: isOwnMessage ? '20px 20px 5px 20px' : '20px 20px 20px 5px',
          maxWidth: '70%',
        }}
      >
        <Typography variant="body1">{message.content}</Typography>
        <Typography 
            variant="caption" 
            sx={{ 
                display: 'block', 
                textAlign: 'right', 
                color: isOwnMessage ? 'rgba(255,255,255,0.7)' : 'text.secondary',
                mt: 0.5 
            }}
        >
          {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Typography>
      </Paper>
    </Box>
  );
}
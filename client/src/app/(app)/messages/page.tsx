// Dosya: client/src/app/(app)/messages/page.tsx
'use client';

import { Box, Typography } from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';

export default function MessagesPage() {
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100%',
        color: 'text.secondary'
      }}
    >
      <ChatIcon sx={{ fontSize: 60, mb: 2 }} />
      <Typography variant="h6">Bir sohbet seçin</Typography>
      <Typography>Başlamak için soldaki listeden bir konuşma seçin.</Typography>
    </Box>
  );
}
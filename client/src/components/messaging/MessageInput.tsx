// Dosya: client/src/components/messaging/MessageInput.tsx
'use client';

import { useState } from 'react';
import { Box, TextField, IconButton } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

interface MessageInputProps {
  onSendMessage: (content: string) => void;
}

export default function MessageInput({ onSendMessage }: MessageInputProps) {
  const [content, setContent] = useState('');

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (content.trim()) {
      onSendMessage(content.trim());
      setContent('');
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', alignItems: 'center', p: 1, borderTop: 1, borderColor: 'divider' }}>
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Bir mesaj yazın..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        size="small"
        autoComplete="off"
      />
      <IconButton type="submit" color="primary" sx={{ ml: 1 }}>
        <SendIcon />
      </IconButton>
    </Box>
  );
}
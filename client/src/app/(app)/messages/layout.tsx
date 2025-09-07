// Dosya: client/src/app/(app)/messages/layout.tsx
'use client';

import { Box, Paper } from '@mui/material';
import ConversationList from '@/components/messaging/ConversationList'


export default function MessagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 }, height: 'calc(100vh - 80px)' /* Navbar yüksekliğini çıkar */ }}>
      <Paper
        elevation={3}
        sx={{
          display: 'flex',
          height: '100%',
          width: '100%',
          overflow: 'hidden', // İçerik taşmasını engelle
        }}
      >
        {/* SOL SÜTUN: Konuşma Listesi */}
        <Box
          sx={{
            width: { xs: '100%', sm: '320px' },
            flexShrink: 0,
            borderRight: { sm: 1 },
            borderColor: { sm: 'divider' },
            display: { xs: 'none', sm: 'flex' }, // Mobil için düzenleme gerekebilir
            flexDirection: 'column'
          }}
        >
          <ConversationList />
        </Box>

        {/* SAĞ SÜTUN: Seçili Konuşmanın İçeriği */}
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          {children}
        </Box>
      </Paper>
    </Box>
  );
}
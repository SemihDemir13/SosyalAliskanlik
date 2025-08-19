// Dosya: client/src/app/(auth)/please-confirm/page.tsx
'use client';
import { Container, Typography, Box, Paper, Icon } from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';

export default function PleaseConfirmPage() {
  return (
    <Container component="main" maxWidth="sm">
      <Paper sx={{ mt: 8, p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <EmailIcon color="primary" sx={{ fontSize: 60, mb: 2 }} />
        <Typography component="h1" variant="h4" gutterBottom>
          Neredeyse Bitti!
        </Typography>
        <Typography variant="body1" align="center">
          Kayıt işlemini tamamlamak için e-posta adresinize gönderdiğimiz doğrulama linkine tıklamanız gerekmektedir.
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 2 }}>
          (E-postayı göremiyorsanız, lütfen spam veya gereksiz klasörünü de kontrol edin.)
        </Typography>
      </Paper>
    </Container>
  );
}
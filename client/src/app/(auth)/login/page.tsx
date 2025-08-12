// Dosya: client/src/app/(auth)/login/page.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axios from 'axios';

// MUI Bileşenleri (Paper eklendi)
import { Box, Button, Container, TextField, Typography, Link, Alert, Paper } from '@mui/material';
import { useState } from 'react';

// Zod şeması
const loginSchema = z.object({
  email: z.string().email('Geçerli bir e-posta girin.'),
  password: z.string().min(1, 'Şifre alanı boş bırakılamaz.'),
});

type LoginFormInputs = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit: SubmitHandler<LoginFormInputs> = async (data) => {
    setError(null);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const response = await axios.post(`${apiUrl}/api/Auth/login`, data);
      localStorage.setItem('accessToken', response.data.accessToken);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Giriş başarısız oldu.');
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h5" gutterBottom>
          Giriş Yap
        </Typography>

        {/* --- YAPIYI DEĞİŞTİRİYORUZ --- */}
        {/* Formu ve içeriğini Paper bileşeni ile sarmalıyoruz */}
        <Paper elevation={3} sx={{ p: 4, width: '100%', mt: 2 }}>
          <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="email"
              label="E-posta Adresi"
              autoComplete="email"
              autoFocus
              {...register('email')}
              error={!!errors.email}
              helperText={errors.email?.message}
            />
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              label="Şifre"
              type="password"
              id="password"
              autoComplete="current-password"
              {...register('password')}
              error={!!errors.password}
              helperText={errors.password?.message}
            />
            
            {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
            
            <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }} disabled={isSubmitting}>
              {isSubmitting ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
            </Button>
          </Box>
        </Paper>
        {/* --- DEĞİŞİKLİK BİTTİ --- */}

        <Box textAlign="center" sx={{ mt: 2 }}>
          <Link href="/register" variant="body2">
            Hesabın yok mu? Kayıt Ol
          </Link>
        </Box>
      </Box>
    </Container>
  );
}
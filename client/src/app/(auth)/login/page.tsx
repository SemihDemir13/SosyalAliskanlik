// Dosya: client/src/app/(auth)/login/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axios from 'axios';

import { Box, Button, Container, TextField, Typography, Link, Alert, Paper } from '@mui/material';


const loginSchema = z.object({
  email: z.string().email('Lütfen geçerli bir e-posta adresi girin.'),
  password: z.string().min(1, 'Şifre alanı boş bırakılamaz.'),
});

// TypeScript için form tipi
type LoginFormInputs = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Sayfa ilk yüklendiğinde, URL'de "confirmed=true" parametresi var mı diye kontrol et.
  useEffect(() => {
    if (searchParams.get('confirmed') === 'true') {
      setSuccessMessage('E-postanız başarıyla doğrulandı. Lütfen giriş yapın.');
    }
  }, [searchParams]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
  });

  // Form gönderildiğinde çalışacak fonksiyon
  const onSubmit: SubmitHandler<LoginFormInputs> = async (data) => {
    setError(null);
    setSuccessMessage(null); // Yeni bir giriş denemesi yapıldığında başarı mesajını temizle
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const response = await axios.post(`${apiUrl}/api/Auth/login`, data);
      
      const { accessToken } = response.data;
      localStorage.setItem('accessToken', accessToken);

      router.push('/dashboard');
    } catch (err: any) {
      // Hata mesajını (örn: "Lütfen e-postanızı doğrulayın.") backend'den al ve göster
      setError(err.response?.data?.message || 'Giriş başarısız oldu. Bilgilerinizi kontrol edin.');
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

        {/* E-posta doğrulamasından sonra gösterilecek başarı mesajı */}
        {successMessage && <Alert severity="success" sx={{ mt: 2, width: '100%' }}>{successMessage}</Alert>}

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
            
            {/* Giriş hataları (yanlış şifre, doğrulanmamış e-posta vb.) için Alert */}
            {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
            
            <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }} disabled={isSubmitting}>
              {isSubmitting ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
            </Button>
          </Box>
        </Paper>

        <Box textAlign="center" sx={{ mt: 2 }}>
          <Link href="/register" variant="body2">
            Hesabın yok mu? Kayıt Ol
          </Link>
        </Box>
      </Box>
    </Container>
  );
}
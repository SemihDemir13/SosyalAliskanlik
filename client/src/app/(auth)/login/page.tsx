// Dosya: client/src/app/(auth)/login/page.tsx
'use client';

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axios from 'axios';
import { useRouter } from 'next/navigation';

// MUI Bileşenleri
import { TextField, Button, Container, Typography, Box, Alert, Link } from '@mui/material';

// 1. Zod ile login formu için doğrulama şeması
const loginSchema = z.object({
  email: z.string().email('Lütfen geçerli bir e-posta adresi girin.'),
  password: z.string().min(1, 'Şifre alanı boş bırakılamaz.'), // Sadece varlığını kontrol ediyoruz
});

// 2. TypeScript tipi
type LoginFormInputs = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  // 3. react-hook-form'u başlatma
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
  });

  // 4. Form gönderildiğinde çalışacak fonksiyon
  const onSubmit: SubmitHandler<LoginFormInputs> = async (data) => {
    setError(null);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const response = await axios.post(`${apiUrl}/api/Auth/login`, data);
      
      // API'den dönen token'ı al
      const { accessToken } = response.data;

      // Token'ı tarayıcının yerel deposuna (localStorage) kaydet
      localStorage.setItem('accessToken', accessToken);

      // Kullanıcıyı dashboard'a yönlendir
      router.push('/dashboard');

    } catch (err: any) {
      if (axios.isAxiosError(err) && err.response) {
        // Backend'den gelen 401 Unauthorized hatası
        setError(err.response.data.message || 'Giriş başarısız. Bilgilerinizi kontrol edin.');
      } else {
        setError('Beklenmedik bir hata oluştu. Lütfen tekrar deneyin.');
      }
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
        <Typography component="h1" variant="h5">
          Giriş Yap
        </Typography>
        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ mt: 1 }}>
          <TextField
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

          {error && <Alert severity="error" sx={{ mt: 2, width: '100%' }}>{error}</Alert>}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
          </Button>
          
          <Box textAlign="center">
            <Link href="/register" variant="body2">
              Hesabın yok mu? Kayıt Ol
            </Link>
          </Box>
        </Box>
      </Box>
    </Container>
  );
}
// Dosya: client/src/app/(auth)/register/page.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axios from 'axios';

// MUI Bileşenleri
import { Box, Button, Container, TextField, Typography, Link, Alert } from '@mui/material';
import { useState } from 'react';

// Register için Zod şeması
const registerSchema = z.object({
  name: z.string().min(2, 'İsim en az 2 karakter olmalıdır.'),
  email: z.string().email('Geçerli bir e-posta girin.'),
  password: z.string().min(6, 'Şifre en az 6 karakter olmalıdır.'),
});

type RegisterFormInputs = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterFormInputs>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit: SubmitHandler<RegisterFormInputs> = async (data) => {
    setError(null);
    setSuccess(null);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      await axios.post(`${apiUrl}/api/Auth/register`, data);
      setSuccess('Kaydınız başarıyla oluşturuldu! Giriş sayfasına yönlendiriliyorsunuz...');
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Kayıt sırasında bir hata oluştu.');
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h5">
          Hesap Oluştur
        </Typography>
        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ mt: 3 }}>
          <TextField variant="outlined" margin="normal" required fullWidth id="name" label="İsim Soyisim" autoComplete="name" autoFocus {...register('name')} error={!!errors.name} helperText={errors.name?.message} />
          <TextField variant="outlined" margin="normal" required fullWidth id="email" label="E-posta Adresi" autoComplete="email" {...register('email')} error={!!errors.email} helperText={errors.email?.message} />
          <TextField variant="outlined" margin="normal" required fullWidth label="Şifre" type="password" id="password" autoComplete="new-password" {...register('password')} error={!!errors.password} helperText={errors.password?.message} />
          
          {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
          
          <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }} disabled={isSubmitting}>
            {isSubmitting ? 'Kaydediliyor...' : 'Kayıt Ol'}
          </Button>
          <Box textAlign="center">
            <Link href="/login" variant="body2">
              Zaten bir hesabın var mı? Giriş Yap
            </Link>
          </Box>
        </Box>
      </Box>
    </Container>
  );
}
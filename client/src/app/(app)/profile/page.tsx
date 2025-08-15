// Dosya: client/src/app/(app)/profile/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axios from 'axios';
import { useSnackbar } from 'notistack';
import { TextField, Button, Typography, Box, Paper, CircularProgress, Divider } from '@mui/material';

// Şifre değiştirme formu için yeni Zod şeması
const passwordSchema = z.object({
    currentPassword: z.string().min(1, 'Mevcut şifre boş bırakılamaz.'),
    newPassword: z.string().min(6, 'Yeni şifre en az 6 karakter olmalıdır.'),
});

type PasswordFormInputs = z.infer<typeof passwordSchema>;

export default function ProfilePage() {
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string } | null>(null);

  const {
    register,
    handleSubmit,
    reset, // Formu sıfırlamak için
    formState: { errors, isSubmitting },
  } = useForm<PasswordFormInputs>({
    resolver: zodResolver(passwordSchema),
  });

  // Sadece kullanıcı bilgilerini çekmek için useEffect
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      if (!token) return;
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const response = await axios.get(`${apiUrl}/api/Auth/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCurrentUser(response.data);
      } catch (error) {
        enqueueSnackbar('Profil bilgileri yüklenemedi.', { variant: 'error' });
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [enqueueSnackbar]);

  // Şifre formu gönderildiğinde çalışacak fonksiyon
  const onPasswordSubmit: SubmitHandler<PasswordFormInputs> = async (data) => {
    try {
      const token = localStorage.getItem('accessToken');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      await axios.put(`${apiUrl}/api/Users/profile/password`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      enqueueSnackbar('Şifre başarıyla güncellendi!', { variant: 'success' });
      reset(); // Form alanlarını temizle
    } catch (err: any) {
      enqueueSnackbar(err.response?.data?.message || 'Güncelleme başarısız oldu.', { variant: 'error' });
    }
  };
  
  if (loading) {
    return <Box display="flex" justifyContent="center" sx={{ mt: 4 }}><CircularProgress /></Box>;
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>Profilim</Typography>
      
      {/* Kullanıcı Bilgileri Bölümü */}
      <Paper sx={{ p: 4, mt: 3, maxWidth: '600px' }}>
        <Typography variant="h6" gutterBottom>Kullanıcı Bilgileri</Typography>
        <TextField variant="outlined" margin="normal" fullWidth label="İsim Soyisim" value={currentUser?.name || ''} disabled />
        <TextField variant="outlined" margin="normal" fullWidth label="E-posta Adresi" value={currentUser?.email || ''} disabled />
      </Paper>
      
      {/* Şifre Değiştirme Bölümü */}
      <Paper sx={{ p: 4, mt: 4, maxWidth: '600px' }}>
        <Typography variant="h6" gutterBottom>Şifre Değiştir</Typography>
        <Box component="form" onSubmit={handleSubmit(onPasswordSubmit)} noValidate>
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            label="Mevcut Şifre"
            type="password"
            {...register('currentPassword')}
            error={!!errors.currentPassword}
            helperText={errors.currentPassword?.message}
          />
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            label="Yeni Şifre"
            type="password"
            {...register('newPassword')}
            error={!!errors.newPassword}
            helperText={errors.newPassword?.message}
          />
          <Button type="submit" variant="contained" sx={{ mt: 3 }} disabled={isSubmitting}>
            {isSubmitting ? 'Güncelleniyor...' : 'Şifreyi Güncelle'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
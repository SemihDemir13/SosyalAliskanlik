// Dosya: client/src/app/(app)/profile/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axios from 'axios';
import { useSnackbar } from 'notistack';
import { TextField, Button, Typography, Box, Paper, CircularProgress, Divider } from '@mui/material';
import HabitList from '@/components/habits/HabitList'; 
import { Habit } from '@/types'; 

// Şifre değiştirme formu için Zod şeması
const passwordSchema = z.object({
    currentPassword: z.string().min(1, 'Mevcut şifre boş bırakılamaz.'),
    newPassword: z.string().min(6, 'Yeni şifre en az 6 karakter olmalıdır.'),
});

type PasswordFormInputs = z.infer<typeof passwordSchema>;

export default function ProfilePage() {
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(true); // Genel sayfa yüklenme durumu
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string } | null>(null);

  // Arşivlenmiş alışkanlıklar için state'ler
  const [archivedHabits, setArchivedHabits] = useState<Habit[]>([]);
  const [archivedLoading, setArchivedLoading] = useState(true);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PasswordFormInputs>({
    resolver: zodResolver(passwordSchema),
  });

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
        setLoading(false);
        setArchivedLoading(false);
        // İsteğe bağlı: router.push('/login');
        return;
    };

    const fetchAllData = async () => {
        // Her iki veri çekme işlemi de bittiğinde genel yüklenmeyi durdur
        try {
            // Profil ve Arşiv verilerini paralel olarak çekmeyi dene
            await Promise.all([
                (async () => {
                    try {
                        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
                        const response = await axios.get(`${apiUrl}/api/Auth/profile`, {
                            headers: { Authorization: `Bearer ${token}` },
                        });
                        setCurrentUser(response.data);
                    } catch (error) {
                        console.error("Profil bilgileri yüklenirken hata:", error);
                        enqueueSnackbar('Profil bilgileri yüklenemedi.', { variant: 'error' });
                    }
                })(),

                (async () => {
                    setArchivedLoading(true);
                    try {
                        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
                        const response = await axios.get(`${apiUrl}/api/Habit?includeArchived=true`, {
                            headers: { Authorization: `Bearer ${token}` },
                        });

                        const todayStr = new Date().toISOString().split('T')[0];
                        const habitsWithCompletionStatus = response.data.map((habit: any) => ({
                            ...habit,
                            isCompletedToday: habit.completions?.includes(todayStr) || false
                        }));
                        setArchivedHabits(habitsWithCompletionStatus);
                    } catch (error) {
                        console.error("Arşivlenmiş alışkanlıklar yüklenirken hata:", error);
                        enqueueSnackbar('Arşivlenmiş alışkanlıklar yüklenemedi.', { variant: 'error' });
                    } finally {
                        setArchivedLoading(false);
                    }
                })()
            ]);
        } finally {
            setLoading(false);
        }
    };

    fetchAllData();
  }, [enqueueSnackbar]);

  const onPasswordSubmit: SubmitHandler<PasswordFormInputs> = async (data) => {
    try {
      const token = localStorage.getItem('accessToken');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      await axios.put(`${apiUrl}/api/Users/profile/password`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      enqueueSnackbar('Şifre başarıyla güncellendi!', { variant: 'success' });
      reset();
    } catch (err: any) {
      enqueueSnackbar(err.response?.data?.message || 'Güncelleme başarısız oldu.', { variant: 'error' });
    }
  };
  
  const handleUnarchiveHabit = async (habitId: string) => {
    const originalHabits = [...archivedHabits];
    setArchivedHabits(prevHabits => prevHabits.filter(h => h.id !== habitId));
    enqueueSnackbar('Alışkanlık arşivden çıkarılıyor...', { variant: 'info' });

    try {
        const token = localStorage.getItem('accessToken');
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        await axios.post(`${apiUrl}/api/Habit/${habitId}/unarchive`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
        enqueueSnackbar('Alışkanlık başarıyla etkinleştirildi.', { variant: 'success' });
    } catch (error) {
        setArchivedHabits(originalHabits);
        enqueueSnackbar('Hata: İşlem geri alındı.', { variant: 'error' });
    }
  };
  
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" sx={{ height: 'calc(100vh - 64px)' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: '800px', mx: 'auto', p: 2, pb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>Profilim</Typography>
      
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>Kullanıcı Bilgileri</Typography>
         <TextField 
          variant="outlined" 
          margin="normal" 
          fullWidth 
          label="İsim Soyisim" 
          value={currentUser?.name || ''} 
          InputProps={{
            readOnly: true,
          }}
        />
        <TextField 
          variant="outlined" 
          margin="normal" 
          fullWidth 
          label="E-posta Adresi" 
          value={currentUser?.email || ''} 
          InputProps={{
            readOnly: true,
          }}
        />

      </Paper>
      
      <Paper sx={{ p: 3, mt: 4 }}>
        <Typography variant="h6" gutterBottom>Şifre Değiştir</Typography>
        <Box component="form" onSubmit={handleSubmit(onPasswordSubmit)} noValidate>
          <TextField
            variant="outlined" margin="normal" required fullWidth
            label="Mevcut Şifre" type="password"
            {...register('currentPassword')}
            error={!!errors.currentPassword}
            helperText={errors.currentPassword?.message}
          />
          <TextField
            variant="outlined" margin="normal" required fullWidth
            label="Yeni Şifre" type="password"
            {...register('newPassword')}
            error={!!errors.newPassword}
            helperText={errors.newPassword?.message}
          />
          <Button type="submit" variant="contained" sx={{ mt: 3 }} disabled={isSubmitting}>
            {isSubmitting ? 'Güncelleniyor...' : 'Şifreyi Güncelle'}
          </Button>
        </Box>
      </Paper>

      <Paper sx={{ p: 3, mt: 4 }}>
        <Typography variant="h6" gutterBottom>Arşivlenmiş Alışkanlıklar</Typography>
        <Divider sx={{ my: 2 }} />
        {archivedLoading ? (
            <Box display="flex" justifyContent="center" my={4}><CircularProgress /></Box>
        ) : (
            <HabitList 
                habits={archivedHabits}
                onToggleHabit={() => {}} 
                onArchive={handleUnarchiveHabit}
                isArchivePage={true}
            />
        )}
      </Paper>
    </Box>
  );
}
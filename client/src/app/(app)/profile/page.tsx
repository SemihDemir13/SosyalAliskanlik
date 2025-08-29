// Dosya: client/src/app/(app)/profile/page.tsx
'use client';

import { useEffect, useState, SyntheticEvent, useCallback } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axios from 'axios';
import { useSnackbar } from 'notistack';
import { TextField, Button, Typography, Box, Paper, CircularProgress, Tabs, Tab } from '@mui/material';
import HabitList from '@/components/habits/HabitList'; 
import BadgeList from '@/components/badges/BadgeList';
import ProfileHeader from '@/components/profile/ProfileHeader';
import { Habit, Badge } from '@/types'; 

const passwordSchema = z.object({
    currentPassword: z.string().min(1, 'Mevcut şifre boş bırakılamaz.'),
    newPassword: z.string().min(6, 'Yeni şifre en az 6 karakter olmalıdır.'),
});
type PasswordFormInputs = z.infer<typeof passwordSchema>;

// Sekme panellerini yönetmek için yardımcı bileşen
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}
function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} id={`profile-tabpanel-${index}`} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function ProfilePage() {
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string }>({ name: '', email: '' });
  const [archivedHabits, setArchivedHabits] = useState<Habit[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [archivedLoading, setArchivedLoading] = useState(true);
  const [badgesLoading, setBadgesLoading] = useState(true);
  const [tabIndex, setTabIndex] = useState(0);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PasswordFormInputs>({
    resolver: zodResolver(passwordSchema),
  });

  const fetchBadges = useCallback(async () => {
    setBadgesLoading(true);
    try {
        const token = localStorage.getItem('accessToken');
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const response = await axios.get(`${apiUrl}/api/Badges/my`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        setBadges(response.data);
    } catch (error) {
        console.error("Rozetler yüklenirken hata:", error);
        enqueueSnackbar('Rozetler yüklenemedi.', { variant: 'error' });
    } finally {
        setBadgesLoading(false);
    }
  }, [enqueueSnackbar]);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
        setLoading(false);
        setArchivedLoading(false);
        setBadgesLoading(false);
        return;
    };

    const fetchProfile = async () => {
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
    };

    const fetchArchivedHabits = async () => {
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
    };

    const fetchAllData = async () => {
        try {
            await Promise.all([
                fetchProfile(),
                fetchArchivedHabits(),
                fetchBadges()
            ]);
        } finally {
            setLoading(false);
        }
    };

    fetchAllData();

    const handleFocus = () => {
        if (localStorage.getItem('badges_need_refresh') === 'true') {
            localStorage.removeItem('badges_need_refresh');
            fetchBadges();
        }
    };

    window.addEventListener('focus', handleFocus);

    return () => {
        window.removeEventListener('focus', handleFocus);
    };

  }, [enqueueSnackbar, fetchBadges]);

  const handleTabChange = (event: SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };

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
    return <Box display="flex" justifyContent="center" alignItems="center" sx={{ height: 'calc(100vh - 64px)' }}><CircularProgress /></Box>;
  }

  return (
    <Box sx={{ maxWidth: '800px', mx: 'auto', p: { xs: 1, sm: 2 }, pb: 4 }}>
      <ProfileHeader name={currentUser.name} email={currentUser.email} />

      <Paper sx={{ mt: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabIndex} onChange={handleTabChange} aria-label="profil sekmeleri" variant="fullWidth">
            <Tab label="Kazanılan Rozetler" />
            <Tab label="Arşiv" />
            <Tab label="Ayarlar" />
          </Tabs>
        </Box>
        
        <TabPanel value={tabIndex} index={0}>
          <Typography variant="h6" gutterBottom>Rozet Koleksiyonu</Typography>
          <BadgeList badges={badges} isLoading={badgesLoading} />
        </TabPanel>

        <TabPanel value={tabIndex} index={1}>
          <Typography variant="h6" gutterBottom>Arşivlenmiş Alışkanlıklar</Typography>
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
        </TabPanel>
        
        <TabPanel value={tabIndex} index={2}>
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
        </TabPanel>
      </Paper>
    </Box>
  );
}
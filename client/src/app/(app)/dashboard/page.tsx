// Dosya: client/src/app/(app)dashboard/page.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import AddHabitModal from '@/components/AddHabitModal';
import HabitList from '@/components/HabitList'; // Yeni bileşeni import ediyoruz

// MUI Bileşenleri
import { Container, Typography, Box, CircularProgress, Alert, Fab } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CssBaseline from '@mui/material/CssBaseline'; // Koyu/Açık tema arkaplanını uygular

// Backend'den gelen alışkanlık verisinin tipini tanımlıyoruz
interface Habit {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
   completions: string[];
}

export default function DashboardPage() {
  const router = useRouter();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);

  // Alışkanlıkları ve kullanıcı bilgilerini çeken fonksiyon.
  // useCallback ile sarmalayarak gereksiz yeniden oluşturulmasını önlüyoruz.
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem('accessToken');

    if (!token) {
      router.push('/login');
      return;
    }

    // Token'dan kullanıcı adını ayrıştırma (basit yöntem)
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUserName(payload.name);
    } catch (e) {
        console.error("Token ayrıştırılamadı:", e);
        // Geçersiz token durumunda kullanıcıyı login'e yönlendirebiliriz
        localStorage.removeItem('accessToken');
        router.push('/login');
        return;
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const response = await axios.get(`${apiUrl}/api/Habit`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHabits(response.data);
    } catch (err) {
      setError('Alışkanlıklar yüklenirken bir hata oluştu.');
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        localStorage.removeItem('accessToken');
        router.push('/login');
      }
    } finally {
      setLoading(false);
    }
  }, [router]); // router, bu fonksiyonun bağımlılığıdır.

  // Sayfa ilk yüklendiğinde verileri çekmek için useEffect kullanıyoruz.
  useEffect(() => {
    fetchData();
  }, [fetchData]); // fetchData fonksiyonu değiştiğinde (ilk yüklemede) çalışır.

  // Veri yüklenirken gösterilecek olan içerik
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <>
      <CssBaseline /> {/* Seçtiğimiz temaya göre (light/dark) arkaplan rengini otomatik uygular */}
      <Container maxWidth="md">
        <Box sx={{ my: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Hoş Geldin, {userName || 'Kullanıcı'}!
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
            Bugün harika bir gün olacak. İşte alışkanlıkların.
          </Typography>
          
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          
          {/* Listeleme mantığını artık HabitList bileşeni hallediyor.
              Ona sadece alışkanlık listesini prop olarak gönderiyoruz. */}
              <HabitList habits={habits} onHabitUpdated={fetchData} />

          
        </Box>
      </Container>

      {/* Sağ altta sabit duran, yeni alışkanlık ekleme butonu */}
      <Fab 
        color="secondary" 
        aria-label="add" 
        sx={{ position: 'fixed', bottom: 32, right: 32 }}
        onClick={() => setIsModalOpen(true)}
      >
        <AddIcon />
      </Fab>

      {/* Yeni alışkanlık ekleme modal'ı */}
      <AddHabitModal 
        open={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onHabitAdded={() => {
          setIsModalOpen(false); // Modal'ı kapat
          fetchData(); // Liste anında güncellensin diye verileri yeniden çek
        }}
      />
    </>
  );
}
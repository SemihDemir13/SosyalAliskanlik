// Dosya: client/src/app/(app)/dashboard/page.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import AddHabitModal from '@/components/AddHabitModal';
import HabitList from '@/components/HabitList';

// MUI Bileşenleri
import { Typography, Box, CircularProgress, Alert, Fab, Container } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

// Backend'den gelen alışkanlık verisinin tipini tanımlıyoruz
interface Habit {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  completions: string[];
}

export default function DashboardPage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);

  // Bu sayfa artık AuthGuard tarafından korunduğu için, buraya ulaşıldığında
  // token'ın var olduğu varsayılabilir.
  const fetchData = useCallback(async () => {
    // Veri çekme işlemi başlamadan önce hata mesajını temizle ve yükleme durumunu başlat.
    setError(null);
    setLoading(true);

    const token = localStorage.getItem('accessToken');

    // AuthGuard zaten yönlendirme yapsa da, token'ın olmama ihtimaline karşı bir kontrol.
    if (!token) {
      setLoading(false);
      return;
    }

    // Token'dan kullanıcı adını ayrıştırarak Hoş Geldin mesajını kişiselleştir.
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUserName(payload.name);
    } catch (e) {
        console.error("Token ayrıştırılamadı:", e);
    }

    // Alışkanlıkları API'den çek.
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const response = await axios.get(`${apiUrl}/api/Habit`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHabits(response.data);
    } catch (err) {
      // API'den veri çekilirken bir hata olursa kullanıcıyı bilgilendir.
      setError('Alışkanlıklar yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.');
    } finally {
      // Her durumda (başarılı veya hatalı) yükleme durumunu sonlandır.
      setLoading(false);
    }
  }, []); // Bu fonksiyonun dışarıdan bir bağımlılığı olmadığı için dizi boş.

  // Component ilk yüklendiğinde verileri çekmek için useEffect kullanıyoruz.
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Veri yüklenirken gösterilecek olan içerik
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" sx={{ height: 'calc(100vh - 64px)' }}>
        {/* 64px, Navbar'ın yaklaşık yüksekliğidir. Animasyonu ortalar. */}
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    // <Container> artık AppLayout'ta olduğu için burada tekrar kullanmıyoruz.
    <>
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Hoş Geldin, {userName || 'Kullanıcı'}!
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
          Bugün harika bir gün olacak. İşte alışkanlıkların.
        </Typography>
        
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        <HabitList habits={habits} onHabitUpdated={fetchData} />
      </Box>
      
      {/* Sabit Ekleme Butonu ve Modal */}
      <Fab 
        color="secondary" 
        aria-label="add" 
        sx={{ position: 'fixed', bottom: 32, right: 32 }}
        onClick={() => setIsModalOpen(true)}
      >
        <AddIcon />
      </Fab>

      <AddHabitModal 
        open={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onHabitAdded={() => {
          setIsModalOpen(false);
          fetchData(); // Liste anında güncellensin diye verileri yeniden çek
        }}
      />
    </>
  );
}
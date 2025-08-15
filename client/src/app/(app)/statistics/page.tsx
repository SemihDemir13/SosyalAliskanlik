// Dosya: client/src/app/(app)/statistics/page.tsx
'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

// MUI Bileşenleri
import { Container, Typography, Box, CircularProgress, Alert, Grid, Paper, Divider ,Stack} from '@mui/material';

// Chart.js Bileşenleri
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Chart.js'in ihtiyaç duyduğu modülleri kaydediyoruz.
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Backend'den gelecek istatistik verisinin tipi
interface UserStatistics {
  totalHabits: number;
  totalCompletions: number;
  overallSuccessRate: number;
  mostConsistentHabit: string;
}

export default function StatisticsPage() {
  const [stats, setStats] = useState<UserStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatistics = async () => {
      const token = localStorage.getItem('accessToken');
      // Bu sayfa AuthGuard tarafından korunduğu için token'ın var olduğunu varsayabiliriz.
      if (!token) return;

      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const response = await axios.get(`${apiUrl}/api/Statistics/my-summary`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStats(response.data);
      } catch (err) {
        setError('İstatistikler yüklenirken bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, []);

  // Grafik için veri ve seçenekler
  const chartData = {
    labels: ['Toplam Alışkanlık', 'Toplam Tamamlama'],
    datasets: [
      {
        label: 'Sayılar',
        data: [stats?.totalHabits || 0, stats?.totalCompletions || 0],
        backgroundColor: [
          'rgba(25, 118, 210, 0.6)', // Mavi
          'rgba(102, 187, 106, 0.6)', // Yeşil
        ],
        borderColor: [
          'rgba(25, 118, 210, 1)',
          'rgba(102, 187, 106, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Genel Bakış',
      },
    },
  };

  if (loading) {
    return <Box display="flex" justifyContent="center" alignItems="center" sx={{ height: '80vh' }}><CircularProgress /></Box>;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        İstatistiklerim
      </Typography>
      
      {/* --- GRID YERİNE STACK İLE YENİ YAPI --- */}
      <Box sx={{ mt: 2 }}>
        {/* İstatistik Kartları */}
        <Stack 
          direction={{ xs: 'column', sm: 'row' }} // Küçük ekranlarda alt alta, büyüklerde yan yana
          spacing={3} // Elemanlar arası boşluk
          sx={{ mb: 4 }} // Alttan boşluk
        >
          <Paper sx={{ p: 2, textAlign: 'center', flexGrow: 1 }}>
            <Typography variant="h6">Güncel Toplam Alışkanlık</Typography>
            <Typography variant="h4" color="primary">{stats?.totalHabits}</Typography>
          </Paper>
          <Paper sx={{ p: 2, textAlign: 'center', flexGrow: 1 }}>
            <Typography variant="h6">Toplam Tamamlama</Typography>
            <Typography variant="h4" color="primary">{stats?.totalCompletions}</Typography>
          </Paper>
          <Paper sx={{ p: 2, textAlign: 'center', flexGrow: 1 }}>
            <Typography variant="h6">Başarı Oranı</Typography>
            <Typography variant="h4" color="primary">%{stats?.overallSuccessRate}</Typography>
          </Paper>
          <Paper sx={{ p: 2, textAlign: 'center', flexGrow: 1, overflow: 'hidden' }}>
            <Typography variant="h6">En İstikrarlı</Typography>
            <Typography variant="h4" color="primary" sx={{ textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {stats?.mostConsistentHabit}
            </Typography>
          </Paper>
        </Stack>

        {/* Grafik */}
        <Paper sx={{ p: 2 }}>
          <Typography variant="h5" sx={{ mb: 2 }}>Genel Bakış</Typography>
          <Bar options={chartOptions} data={chartData} />
        </Paper>
      </Box>
      {/* --- YAPI BİTTİ --- */}
    </Box>
  );
}
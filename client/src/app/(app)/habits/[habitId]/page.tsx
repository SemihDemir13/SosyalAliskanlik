// Dosya: client/src/app/(app)/habits/[habitId]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import HeatMap from '@uiw/react-heat-map';


import { Box, CircularProgress, Alert, Paper, Typography, Tooltip } from '@mui/material';

// Heatmap için veri formatı
interface HeatMapValue {
  date: string; // YYYY/AA/GG
  count: number;
}

// Alışkanlık detay verisi tipi
interface HabitDetails {
  id: string;
  name: string;
  description: string | null;
  completions: string[]; // YYYY-AA-GG
}

export default function HabitDetailPage() {
  const params = useParams();
  const habitId = params.habitId as string;

  const [habit, setHabit] = useState<HabitDetails | null>(null);
  const [heatmapData, setHeatmapData] = useState<HeatMapValue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!habitId) return;

    const fetchHabitDetails = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        // Tek bir alışkanlığı getiren API isteği (bu endpoint'i daha önce oluşturmuştuk)
        const response = await axios.get(`${apiUrl}/api/Habit/${habitId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        const habitData: HabitDetails = response.data;
        setHabit(habitData);
        
        // Gelen 'completions' dizisini heatmap'in anlayacağı formata çevir
        if (habitData.completions && Array.isArray(habitData.completions)) {
          const formattedData = habitData.completions.map((dateStr: string) => ({
            date: dateStr.replace(/-/g, '/'), // YYYY-AA-GG'yi YYYY/AA/GG'ye çevir
            count: 1, 
          }));
          setHeatmapData(formattedData);
        }

      } catch (err) {
        setError("Alışkanlık detayları yüklenirken bir hata oluştu.");
      } finally {
        setLoading(false);
      }
    };

    fetchHabitDetails();
  }, [habitId]);

  if (loading) {
    return <Box display="flex" justifyContent="center" sx={{ mt: 4 }}><CircularProgress /></Box>;
  }

  if (error) {
    return <Alert severity="error" sx={{ mt: 4 }}>{error}</Alert>;
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {habit?.name}
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
        {habit?.description || 'Bu alışkanlık için bir açıklama girilmemiş.'}
      </Typography>
      
      <Paper elevation={3} sx={{ p: { xs: 1, sm: 2, md: 3 }, overflowX: 'auto' }}>
        <Typography variant="h6" gutterBottom>
          Son 1 Yılın Tamamlama Haritası
        </Typography>
        <HeatMap
          value={heatmapData}
          width="100%"
          style={{ color: '#888' }}
          startDate={new Date(new Date().setFullYear(new Date().getFullYear() - 1))}
          panelColors={{
            0: '#f5f5f5', // Koyu temada daha iyi görünen renkler
            1: '#39d353',
            2: '#26a641',
            3: '#006d32',
            4: '#0e4429'
          }}
          rectSize={14}
          rectRender={(props, data) => {
            return (
              <Tooltip title={data.count ? `${data.date}: ${data.count} tamamlama` : `${data.date}: Hiç`} placement="top">
                <rect {...props} />
              </Tooltip>
            );
          }}
        />
      </Paper>
    </Box>
  );
}
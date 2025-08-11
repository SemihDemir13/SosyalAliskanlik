// Dosya: client/src/components/HabitList.tsx
'use client';

import { useState } from 'react';
import axios from 'axios';
import { List, ListItem, ListItemText, Typography, Paper, Divider, Checkbox, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

// Dashboard'dan gelecek olan alışkanlık verisinin tipi
interface Habit {
  id: string;
  name: string;
  description: string | null;
  completions: string[]; // Bu, alışkanlığın tamamlandığı tarihleri içerir
}

// Bu bileşenin Dashboard'dan alacağı props'lar
interface HabitListProps {
  habits: Habit[];
  onHabitUpdated: () => void; // Bir alışkanlık güncellendiğinde (örn: tamamlandığında) Dashboard'a haber vermek için
}

// Sadece bugünün tarihini YYYY-AA-GG formatında döndüren bir yardımcı fonksiyon
const getTodayDateString = () => new Date().toISOString().split('T')[0];

export default function HabitList({ habits, onHabitUpdated }: HabitListProps) {
  // Bu state, SADECE arayüzdeki checkbox'ların durumunu yönetmek için vardır.
  // Başlangıç değeri, Dashboard'dan gelen veriye göre belirlenir.
  const [completions, setCompletions] = useState<Set<string>>(() => {
    const today = getTodayDateString();
    const initialCompletions = new Set<string>();
    habits.forEach(habit => {
      // Eğer alışkanlığın tamamlanma tarihleri arasında bugün varsa, set'e ekle
      if (habit.completions.includes(today)) {
        initialCompletions.add(habit.id);
      }
    });
    return initialCompletions;
  });

  // Checkbox'a tıklandığında çalışacak olan fonksiyon
  const handleToggleCompletion = async (habitId: string) => {
    const token = localStorage.getItem('accessToken');
    const today = getTodayDateString();
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const isCurrentlyCompleted = completions.has(habitId);

    // 1. İyimser Arayüz Güncellemesi (Optimistic UI Update):
    // API cevabını beklemeden arayüzü anında güncelleyerek kullanıcıya hızlı bir geri bildirim veriyoruz.
    const newCompletions = new Set(completions);
    if (isCurrentlyCompleted) {
      newCompletions.delete(habitId);
    } else {
      newCompletions.add(habitId);
    }
    setCompletions(newCompletions);

    // 2. API İsteğini Gönderme
    try {
      if (isCurrentlyCompleted) {
        // İşaretliydi, işareti kaldırıyoruz (DELETE)
        await axios.delete(`${apiUrl}/api/Habit/${habitId}/completions/${today}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        // İşaretli değildi, işaretliyoruz (POST)
        await axios.post(`${apiUrl}/api/Habit/${habitId}/completions`,
          { completionDate: today },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      // 3. Başarılı olursa, Dashboard'a haber vererek tüm verinin en güncel halini çekmesini sağla.
      // Bu, özellikle seri (streak) gibi hesaplamaları doğru tutmak için önemlidir.
      onHabitUpdated();
    } catch (error) {
      console.error("Tamamlama durumu güncellenirken hata oluştu:", error);
      // Hata durumunda arayüzü eski haline geri al
      setCompletions(completions); 
      alert('Bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  // Eğer hiç alışkanlık yoksa gösterilecek mesaj
  if (habits.length === 0) {
    return (
      <Paper elevation={3}>
        <Typography sx={{ p: 3, textAlign: 'center' }}>
          Henüz bir alışkanlık eklemedin. Başlamak için sağ alttaki '+' butonuna tıkla!
        </Typography>
      </Paper>
    );
  }

  // Alışkanlık listesinin render edildiği kısım
  return (
    <Paper elevation={3}>
      <List>
        {habits.map((habit, index) => (
          <div key={habit.id}>
            <ListItem
              secondaryAction={
                <>
                  <IconButton edge="end" aria-label="edit">
                    <EditIcon />
                  </IconButton>
                  <IconButton edge="end" aria-label="delete">
                    <DeleteIcon />
                  </IconButton>
                </>
              }
            >
              <Checkbox
                edge="start"
                checked={completions.has(habit.id)} // İşaretli olup olmadığı state'e göre belirlenir
                onChange={() => handleToggleCompletion(habit.id)}
              />
              <ListItemText 
                primary={habit.name} 
                secondary={habit.description || 'Açıklama yok'} 
              />
            </ListItem>
            {index < habits.length - 1 && <Divider />}
          </div>
        ))}
      </List>
    </Paper>
  );
}
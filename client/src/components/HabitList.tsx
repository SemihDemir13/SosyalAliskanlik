// Dosya: client/src/components/HabitList.tsx
'use client';

import { useState } from 'react';
import axios from 'axios';
import { List, ListItem, ListItemText, Typography, Paper, Divider, Checkbox, IconButton, Box } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import EditHabitModal from './EditHabitModal'; 
import DeleteConfirmationDialog from './DeleteConfirmationDialog';

// Dashboard'dan gelecek olan alışkanlık verisinin tipi
interface Habit {
  id: string;
  name: string;
  description: string | null;
  completions: string[];
}

// Bu bileşenin Dashboard'dan alacağı props'lar
interface HabitListProps {
  habits: Habit[];
  onHabitUpdated: () => void; // Liste değiştiğinde Dashboard'a haber vermek için
}

// Sadece bugünün tarihini YYYY-AA-GG formatında döndüren bir yardımcı fonksiyon
const getTodayDateString = () => new Date().toISOString().split('T')[0];

export default function HabitList({ habits, onHabitUpdated }: HabitListProps) {
  // Bu state, SADECE arayüzdeki checkbox'ların durumunu yönetmek için vardır.
  const [completions, setCompletions] = useState<Set<string>>(() => {
    const today = getTodayDateString();
    const initialCompletions = new Set<string>();
    habits.forEach(habit => {
      if (habit.completions.includes(today)) {
        initialCompletions.add(habit.id);
      }
    });
    return initialCompletions;
  });

  // Düzenleme ve silme modallarının durumunu yöneten state'ler
  const [habitToEdit, setHabitToEdit] = useState<Habit | null>(null);
  const [habitToDelete, setHabitToDelete] = useState<Habit | null>(null);

  // Checkbox'a tıklandığında çalışacak olan fonksiyon
  const handleToggleCompletion = async (habitId: string) => {
    const token = localStorage.getItem('accessToken');
    const today = getTodayDateString();
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const isCurrentlyCompleted = completions.has(habitId);

    // İyimser Arayüz Güncellemesi
    const newCompletions = new Set(completions);
    if (isCurrentlyCompleted) {
      newCompletions.delete(habitId);
    } else {
      newCompletions.add(habitId);
    }
    setCompletions(newCompletions);

    try {
      if (isCurrentlyCompleted) {
        await axios.delete(`${apiUrl}/api/Habit/${habitId}/completions/${today}`, { headers: { Authorization: `Bearer ${token}` } });
      } else {
        await axios.post(`${apiUrl}/api/Habit/${habitId}/completions`, { completionDate: today }, { headers: { Authorization: `Bearer ${token}` } });
      }
      onHabitUpdated(); // Tüm veriyi yeniden çekmek için Dashboard'a haber ver
    } catch (error) {
      console.error("Tamamlama durumu güncellenirken hata oluştu:", error);
      setCompletions(completions); // Hata durumunda state'i geri al
      alert('Bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  // Silme diyaloğunda "Sil" butonuna basıldığında çalışır
  const handleDeleteConfirm = async () => {
    if (!habitToDelete) return;
    try {
      const token = localStorage.getItem('accessToken');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      await axios.delete(`${apiUrl}/api/Habit/${habitToDelete.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHabitToDelete(null); // Diyaloğu kapat
      onHabitUpdated(); // Listeyi yenile
    } catch (error) {
      console.error("Alışkanlık silinirken hata oluştu:", error);
      alert('Alışkanlık silinirken bir hata oluştu.');
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
    <>
      <Paper elevation={3}>
        <List>
          {habits.map((habit, index) => (
            <div key={habit.id}>
              <ListItem
                secondaryAction={
                  <Box>
                    <IconButton edge="end" aria-label="edit" onClick={() => setHabitToEdit(habit)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton edge="end" aria-label="delete" onClick={() => setHabitToDelete(habit)}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                }
              >
                <Checkbox
                  edge="start"
                  checked={completions.has(habit.id)}
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

      {/* Düzenleme ve Silme için kullanılacak olan, görünmez bileşenler */}
      <EditHabitModal 
        habit={habitToEdit}
        open={!!habitToEdit}
        onClose={() => setHabitToEdit(null)}
        onHabitUpdated={() => {
          setHabitToEdit(null); // Modal'ı kapat
          onHabitUpdated(); // Listeyi yenile
        }}
      />
      <DeleteConfirmationDialog 
        open={!!habitToDelete}
        onClose={() => setHabitToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Alışkanlığı Sil"
        message={`'${habitToDelete?.name}' adlı alışkanlığı kalıcı olarak silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`}
      />
    </>
  );
}
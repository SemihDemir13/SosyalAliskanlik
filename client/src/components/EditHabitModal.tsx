// Dosya: client/src/components/EditHabitModal.tsx
'use client';
import { useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axios from 'axios';
import { useState } from 'react';
import { TextField, Button, Dialog, DialogActions, DialogContent, DialogTitle, Box, Alert } from '@mui/material';

const habitSchema = z.object({
  name: z.string().min(2, 'İsim en az 2 karakter olmalıdır.'),
  description: z.string().optional(),
});

type HabitFormInputs = z.infer<typeof habitSchema>;

interface Habit {
  id: string;
  name: string;
  description: string | null;
}

interface EditHabitModalProps {
  habit: Habit | null; // Düzenlenecek alışkanlık
  open: boolean;
  onClose: () => void;
  onHabitUpdated: () => void;
}

export default function EditHabitModal({ habit, open, onClose, onHabitUpdated }: EditHabitModalProps) {
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm<HabitFormInputs>({ resolver: zodResolver(habitSchema) });
  
  // Modal açıldığında veya düzenlenecek alışkanlık değiştiğinde form alanlarını doldur
  useEffect(() => {
    if (habit) {
      setValue('name', habit.name);
      setValue('description', habit.description || '');
    }
  }, [habit, setValue]);

  const onSubmit: SubmitHandler<HabitFormInputs> = async (data) => {
    if (!habit) return;
    setError(null);
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) throw new Error('Yetkilendirme token\'ı bulunamadı.');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      await axios.put(`${apiUrl}/api/Habit/${habit.id}`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      onHabitUpdated();
      handleClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Güncelleme sırasında bir hata oluştu.');
    }
  };

  const handleClose = () => {
    reset();
    setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} PaperProps={{ component: 'form', onSubmit: handleSubmit(onSubmit) }}>
      <DialogTitle>Alışkanlığı Düzenle</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <TextField autoFocus margin="dense" id="name" label="Alışkanlık Adı" type="text" fullWidth {...register('name')} error={!!errors.name} helperText={errors.name?.message} />
        <TextField margin="dense" id="description" label="Açıklama" type="text" fullWidth multiline rows={4} {...register('description')} />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>İptal</Button>
        <Button type="submit" variant="contained" disabled={isSubmitting}>{isSubmitting ? 'Kaydediliyor...' : 'Kaydet'}</Button>
      </DialogActions>
    </Dialog>
  );
}
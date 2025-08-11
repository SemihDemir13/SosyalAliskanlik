// Dosya: client/src/components/AddHabitModal.tsx
'use client';
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

interface AddHabitModalProps {
  open: boolean;
  onClose: () => void;
  onHabitAdded: () => void;
}

export default function AddHabitModal({ open, onClose, onHabitAdded }: AddHabitModalProps) {
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<HabitFormInputs>({ resolver: zodResolver(habitSchema) });

  const onSubmit: SubmitHandler<HabitFormInputs> = async (data) => {
    setError(null);
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) throw new Error('Yetkilendirme token\'ı bulunamadı.');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      await axios.post(`${apiUrl}/api/Habit`, data, { headers: { Authorization: `Bearer ${token}` } });
      onHabitAdded();
      handleClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Bir hata oluştu.');
    }
  };

  const handleClose = () => {
    reset();
    setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} PaperProps={{ component: 'form', onSubmit: handleSubmit(onSubmit) }}>
      <DialogTitle>Yeni Alışkanlık Ekle</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <TextField autoFocus margin="dense" id="name" label="Alışkanlık Adı" type="text" fullWidth variant="outlined" {...register('name')} error={!!errors.name} helperText={errors.name?.message} />
        <TextField margin="dense" id="description" label="Açıklama (İsteğe Bağlı)" type="text" fullWidth multiline rows={4} variant="outlined" {...register('description')} />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>İptal</Button>
        <Button type="submit" variant="contained" disabled={isSubmitting}>{isSubmitting ? 'Ekleniyor...' : 'Ekle'}</Button>
      </DialogActions>
    </Dialog>
  );
}
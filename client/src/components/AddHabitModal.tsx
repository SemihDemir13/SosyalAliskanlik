// Dosya: client/src/components/AddHabitModal.tsx
'use client';

import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axios from 'axios';
import { useState } from 'react';
import { 
    TextField, 
    Button, 
    Dialog, 
    DialogActions, 
    DialogContent, 
    DialogTitle, 
    Box, 
    Alert, 
    Divider, 
    Typography, 
    CircularProgress,
    List,
    ListItem,
    ListItemText,
    IconButton,
    Tooltip
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

const habitSchema = z.object({
  name: z.string().min(2, 'İsim en az 2 karakter olmalıdır.'),
  description: z.string().optional(),
});
type HabitFormInputs = z.infer<typeof habitSchema>;

interface Suggestion {
    name: string;
    description: string;
}

interface AddHabitModalProps {
  open: boolean;
  onClose: () => void;
  onHabitAdded: () => void;
}

export default function AddHabitModal({ open, onClose, onHabitAdded }: AddHabitModalProps) {
  const [error, setError] = useState<string | null>(null);
  const [goal, setGoal] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [suggestionError, setSuggestionError] = useState<string | null>(null);

  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm<HabitFormInputs>({ resolver: zodResolver(habitSchema) });

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
    setGoal('');
    setSuggestions([]);
    setIsSuggesting(false);
    setSuggestionError(null);
    onClose();
  };

  const handleGetSuggestions = async () => {
    if (!goal.trim()) {
        setSuggestionError('Lütfen bir hedef girin.');
        return;
    }
    setIsSuggesting(true);
    setSuggestionError(null);
    setSuggestions([]);
    try {
        const token = localStorage.getItem('accessToken');
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const response = await axios.post(`${apiUrl}/api/AI/suggest-habits`, JSON.stringify(goal), {
            headers: { 
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json' 
            },
        });
        setSuggestions(response.data);
    } catch (err: any) {
        setSuggestionError(err.response?.data || 'Öneriler getirilirken bir hata oluştu.');
    } finally {
        setIsSuggesting(false);
    }
  };

  const handleSelectSuggestion = (suggestion: Suggestion) => {
    setValue('name', suggestion.name, { shouldValidate: true });
    setValue('description', suggestion.description || '', { shouldValidate: true });
  };

  return (
    <Dialog open={open} onClose={handleClose} PaperProps={{ component: 'form', onSubmit: handleSubmit(onSubmit) }} maxWidth="sm" fullWidth>
      <DialogTitle>Yeni Alışkanlık Ekle</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>Hedefinden Bahset, Sana Yardım Edelim!</Typography>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <TextField placeholder="Örn: Daha sağlıklı yaşamak" variant="outlined" size="small" fullWidth value={goal} onChange={(e) => setGoal(e.target.value)} />
                <Button variant="contained" onClick={handleGetSuggestions} disabled={isSuggesting}>
                    {isSuggesting ? <CircularProgress size={24} /> : 'Öneri Getir'}
                </Button>
            </Box>
            {suggestionError && <Alert severity="error" sx={{ mt: 1 }}>{suggestionError}</Alert>}
            {suggestions.length > 0 && (
                <List sx={{ mt: 1 }}>
                    {suggestions.map((suggestion, index) => (
                        <ListItem key={index} secondaryAction={
                            <Tooltip title="Bu alışkanlığı ekle">
                                <IconButton edge="end" onClick={() => handleSelectSuggestion(suggestion)}>
                                    <AddCircleOutlineIcon color="primary" />
                                </IconButton>
                            </Tooltip>
                        }>
                            <ListItemText primary={suggestion.name} secondary={suggestion.description} />
                        </ListItem>
                    ))}
                </List>
            )}
        </Box>
        
        <Divider />

        <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>Veya Kendin Oluştur</Typography>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            
            {/* DEĞİŞİKLİK BURADA: InputLabelProps={{ shrink: true }} eklendi */}
            <TextField 
                autoFocus 
                margin="dense" 
                id="name" 
                label="Alışkanlık Adı" 
                type="text" 
                fullWidth 
                variant="outlined" 
                {...register('name')} 
                error={!!errors.name} 
                helperText={errors.name?.message} 
                InputLabelProps={{ shrink: true }} 
            />
            <TextField 
                margin="dense" 
                id="description" 
                label="Açıklama (İsteğe Bağlı)" 
                type="text" 
                fullWidth 
                multiline 
                rows={4} 
                variant="outlined" 
                {...register('description')} 
                InputLabelProps={{ shrink: true }}
            />
        </Box>

      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>İptal</Button>
        <Button type="submit" variant="contained" disabled={isSubmitting}>{isSubmitting ? 'Ekleniyor...' : 'Ekle'}</Button>
      </DialogActions>
    </Dialog>
  );
}
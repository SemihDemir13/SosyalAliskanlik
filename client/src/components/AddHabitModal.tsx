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
    Tooltip,
    Checkbox
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';

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
  const [selectedSuggestions, setSelectedSuggestions] = useState<Suggestion[]>([]);
  const [isBatchSubmitting, setIsBatchSubmitting] = useState(false);

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
    setGoal('');
    setSuggestions([]);
    setIsSuggesting(false);
    setSuggestionError(null);
    setSelectedSuggestions([]);
    setIsBatchSubmitting(false);
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
    setSelectedSuggestions([]);
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

  const handleToggleSuggestion = (suggestion: Suggestion) => {
    setSelectedSuggestions((prevSelected) => {
        const isAlreadySelected = prevSelected.some(s => s.name === suggestion.name);
        if (isAlreadySelected) {
            return prevSelected.filter(s => s.name !== suggestion.name);
        } else {
            return [...prevSelected, suggestion];
        }
    });
  };

  const handleAddSelectedSuggestions = async () => {
    if (selectedSuggestions.length === 0) return;
    setError(null);
    setIsBatchSubmitting(true);
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) throw new Error('Yetkilendirme token\'ı bulunamadı.');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      await axios.post(`${apiUrl}/api/Habit/batch-create`, selectedSuggestions, { 
          headers: { Authorization: `Bearer ${token}` } 
      });
      onHabitAdded();
      handleClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Seçilen alışkanlıklar eklenirken bir hata oluştu.');
    } finally {
        setIsBatchSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} PaperProps={{ component: 'form', onSubmit: handleSubmit(onSubmit) }} maxWidth="sm" fullWidth>
      <DialogTitle>Yeni Alışkanlık Ekle</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>Hedefinden Bahset, Sana Yardım Edelim!</Typography>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <TextField placeholder="Örn: Daha sağlıklı yaşamak" variant="outlined" size="small" fullWidth value={goal} onChange={(e) => setGoal(e.target.value)} />
                <Button variant="contained" onClick={handleGetSuggestions} disabled={isSuggesting || isBatchSubmitting}>
                    {isSuggesting ? <CircularProgress size={24} color="inherit" /> : 'Öneri Getir'}
                </Button>
            </Box>
            {suggestionError && <Alert severity="error" sx={{ mt: 1 }}>{suggestionError}</Alert>}
            {suggestions.length > 0 && (
                <List sx={{ mt: 1 }}>
                    {suggestions.map((suggestion, index) => {
                        const isSelected = selectedSuggestions.some(s => s.name === suggestion.name);
                        return (
                            <ListItem key={index} secondaryAction={
                                <Tooltip title={isSelected ? "Seçimi Kaldır" : "Seç"}>
                                    <Checkbox
                                        edge="end"
                                        onChange={() => handleToggleSuggestion(suggestion)}
                                        checked={isSelected}
                                        icon={<RadioButtonUncheckedIcon />}
                                        checkedIcon={<CheckCircleIcon />}
                                    />
                                </Tooltip>
                            }>
                                <ListItemText primary={suggestion.name} secondary={suggestion.description} />
                            </ListItem>
                        );
                    })}
                </List>
            )}
            {selectedSuggestions.length > 0 && (
                <Button 
                    fullWidth 
                    variant="contained" 
                    color="secondary" 
                    sx={{ mt: 2 }}
                    onClick={handleAddSelectedSuggestions}
                    disabled={isBatchSubmitting || isSuggesting}
                >
                    {isBatchSubmitting ? 'Ekleniyor...' : `${selectedSuggestions.length} Seçili Alışkanlığı Ekle`}
                </Button>
            )}
        </Box>
        
        <Divider sx={{ my: 3 }}>VEYA</Divider>

        <Box>
            <Typography variant="subtitle1" gutterBottom>Kendin Oluştur</Typography>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <TextField autoFocus margin="dense" id="name" label="Alışkanlık Adı" type="text" fullWidth variant="outlined" {...register('name')} error={!!errors.name} helperText={errors.name?.message} />
            <TextField margin="dense" id="description" label="Açıklama (İsteğe Bağlı)" type="text" fullWidth multiline rows={4} variant="outlined" {...register('description')} />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>İptal</Button>
        <Button type="submit" variant="contained" disabled={isSubmitting || isBatchSubmitting}>{isSubmitting ? 'Ekleniyor...' : 'Manuel Ekle'}</Button>
      </DialogActions>
    </Dialog>
  );
}
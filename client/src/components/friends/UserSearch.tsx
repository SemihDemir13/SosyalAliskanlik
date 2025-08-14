// Dosya: client/src/components/friends/UserSearch.tsx
'use client';

import { useState } from 'react';
import axios from 'axios';
import { Box, TextField, List, ListItem, ListItemText, Button, CircularProgress, Typography, Paper ,Alert } from '@mui/material';
import { useSnackbar } from 'notistack';

interface User {
  id: string;
  name: string;
  friendshipStatus: 'Pending' | 'Accepted' | 'Declined' | 'Blocked' | null;
}

export default function UserSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleSearch = async (term: string) => {
    setSearchTerm(term);
    setFeedback(null); // Yeni bir arama yapıldığında eski mesajları temizle
    if (term.length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const response = await axios.get(`${apiUrl}/api/Users/search`, {
        params: { term },
        headers: { Authorization: `Bearer ${token}` },
      });
      setResults(response.data);
    } catch (error) {
      console.error("Arama sırasında hata:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddFriend = async (addresseeId: string) => {
    setFeedback(null); // Butona basıldığında eski mesajı temizle
    try {
      const token = localStorage.getItem('accessToken');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      await axios.post(`${apiUrl}/api/Friends/requests`, 
        { addresseeId }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Başarı durumunda feedback state'ini ayarla
      setFeedback({ type: 'success', message: 'Arkadaşlık isteği gönderildi!' });
    } catch (error: any) {
      // Hata durumunda feedback state'ini ayarla
      setFeedback({ type: 'error', message: error.response?.data?.message || 'İstek gönderilemedi.' });
    }
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>Yeni Arkadaş Bul</Typography>
      <TextField
        fullWidth
        label="Kullanıcı adı ile ara..."
        variant="outlined"
        value={searchTerm}
        onChange={(e) => handleSearch(e.target.value)}
        InputProps={{
          endAdornment: loading && <CircularProgress size={20} />,
        }}
      />
      
      {/* --- YENİ EKLENEN ALERT BÖLÜMÜ --- */}
      {feedback && (
        <Alert severity={feedback.type} sx={{ mt: 2 }}>
          {feedback.message}
        </Alert>
      )}

      <List sx={{ mt: 2 }}>
        {results.map((user) => (
          <ListItem key={user.id} secondaryAction={
            // --- KOŞULLU RENDER ETME BÖLÜMÜ ---
            <>
              {user.friendshipStatus === 'Accepted' ? (
                <Typography variant="body2" color="text.secondary">Arkadaş</Typography>
              ) : user.friendshipStatus === 'Pending' ? (
                <Typography variant="body2" color="text.secondary">İstek Gönderildi</Typography>
              ) : (
                <Button variant="contained" size="small" onClick={() => handleAddFriend(user.id)}>
                  Ekle
                </Button>
              )}
            </>
            // --- BİTTİ ---
          }>
            <ListItemText primary={user.name} />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
}
// Dosya: client/src/components/friends/UserSearch.tsx
'use client';

import { useState } from 'react';
import axios from 'axios';
import { Box, TextField, List, ListItem, ListItemText, Button, CircularProgress, Typography, Paper } from '@mui/material';
import { useSnackbar } from 'notistack';

interface User {
  id: string;
  name: string;
}

export default function UserSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const handleSearch = async (term: string) => {
    setSearchTerm(term);
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
    try {
      const token = localStorage.getItem('accessToken');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      await axios.post(`${apiUrl}/api/Friends/requests`, 
        { addresseeId }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      enqueueSnackbar('Arkadaşlık isteği gönderildi!', { variant: 'success' });
    } catch (error: any) {
      enqueueSnackbar(error.response?.data?.message || 'İstek gönderilemedi.', { variant: 'error' });
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
      <List sx={{ mt: 2 }}>
        {results.map((user) => (
          <ListItem key={user.id} secondaryAction={
            <Button variant="contained" size="small" onClick={() => handleAddFriend(user.id)}>
              Ekle
            </Button>
          }>
            <ListItemText primary={user.name} />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
}
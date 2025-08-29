// Dosya: client/src/components/DeleteConfirmationDialog.tsx
'use client';

import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';

// HATA DÜZELTİLDİ: Arayüzü doğru prop'ları alacak şekilde güncelliyoruz
interface DeleteConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string; // Bu satır muhtemelen eksikti
}

export default function DeleteConfirmationDialog({ open, onClose, onConfirm, title, description }: DeleteConfirmationDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
      <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">{description}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>İptal</Button>
        <Button onClick={onConfirm} color="error" autoFocus>
          Sil
        </Button>
      </DialogActions>
    </Dialog>
  );
}
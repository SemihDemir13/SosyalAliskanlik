// Dosya: client/src/app/(auth)/confirm-email/page.tsx
'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import { Container, Typography, Box, Paper, CircularProgress, Alert, Button, AlertColor } from '@mui/material';

function ConfirmEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Sayfanın genel durumunu yönetir: 'loading', 'success', 'error'
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  // Alert bileşeninin rengini yönetir: 'info', 'success', 'error'
  const [alertSeverity, setAlertSeverity] = useState<AlertColor>('info');
  // Kullanıcıya gösterilecek mesajı tutar
  const [message, setMessage] = useState('E-posta adresiniz doğrulanıyor, lütfen bekleyin...');

  useEffect(() => {
    // URL'den 'userId' ve 'token' parametrelerini al
    const userId = searchParams.get('userId');
    const token = searchParams.get('token');

    // Eğer parametreler eksikse, işlemi durdur ve hata göster
    if (!userId || !token) {
      setMessage('Geçersiz doğrulama linki. Lütfen e-postanızdaki linki kontrol edin.');
      setStatus('error');
      setAlertSeverity('error');
      return;
    }

    // Backend'e doğrulama isteği gönderen asenkron fonksiyon
    const confirmEmail = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        // Backend'deki /api/Auth/confirm-email endpoint'ine GET isteği at
        await axios.get(`${apiUrl}/api/Auth/confirm-email`, { params: { userId, token } });
        
        // İstek başarılı olursa...
        setMessage('E-postanız başarıyla doğrulandı! Giriş sayfasına yönlendiriliyorsunuz...');
        setStatus('success');
        setAlertSeverity('success');
        
        // 2 saniye bekle ve kullanıcıyı login sayfasına yönlendir.
        // URL'e '?confirmed=true' ekleyerek, login sayfasının bir başarı mesajı göstermesini sağla.
        setTimeout(() => {
          router.push('/login?confirmed=true');
        }, 2000);

      } catch (err: any) {
        // İstek başarısız olursa...
        setMessage(err.response?.data?.message || 'Doğrulama sırasında bilinmeyen bir hata oluştu.');
        setStatus('error');
        setAlertSeverity('error');
      }
    };

    // Fonksiyonu çağır
    confirmEmail();
    
  }, [searchParams, router]); // useEffect'in bağımlılıkları

  return (
    <Container component="main" maxWidth="sm">
      <Paper sx={{ mt: 8, p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* Duruma göre başlığı ve ikonu göster */}
        {status === 'loading' && <CircularProgress sx={{ mb: 2 }} />}
        
        <Typography component="h1" variant="h5" gutterBottom>
          {status === 'loading' && 'E-posta Doğrulama'}
          {status === 'success' && 'Doğrulama Başarılı!'}
          {status === 'error' && 'Doğrulama Başarısız!'}
        </Typography>
        
        {/* Her durumda bir mesaj göster */}
        <Alert severity={alertSeverity} sx={{ width: '100%', mt: 2, textAlign: 'center' }}>
          {message}
        </Alert>
        
        {/* Sadece hata veya başarı durumunda "Giriş Sayfasına Git" butonunu göster */}
        {status !== 'loading' && (
          <Button variant="contained" sx={{ mt: 3 }} onClick={() => router.push('/login')}>
            Giriş Sayfasına Git
          </Button>
        )}
      </Paper>
    </Container>
  );
}

// `useSearchParams`'in Sunucu Bileşenlerinde (SSR) düzgün çalışması için
// bileşeni bir <Suspense> bloğu ile sarmalamak en iyi pratiktir.
export default function ConfirmEmailPage() {
  return (
    <Suspense fallback={<CircularProgress />}>
      <ConfirmEmailContent />
    </Suspense>
  );
}
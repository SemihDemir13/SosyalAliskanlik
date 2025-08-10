// Dosya: client/src/app/(auth)/register/page.tsx
'use client'; // Bu bileşenin interaktif (form, state vb.) olduğunu belirtir.

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axios from 'axios';
import { useRouter } from 'next/navigation'; // Yönlendirme için

// MUI Bileşenleri
import { TextField, Button, Container, Typography, Box, Alert, Link } from '@mui/material';

// 1. Zod ile form doğrulama şeması
// Bu şema, formdaki her alan için kuralları ve hata mesajlarını tanımlar.
const registerSchema = z.object({
  name: z.string().min(2, 'İsim en az 2 karakter olmalıdır.'),
  email: z.string().email('Lütfen geçerli bir e-posta adresi girin.'),
  password: z.string().min(6, 'Şifre en az 6 karakter olmalıdır.'),
});

// 2. TypeScript için form verilerinin tipini Zod şemasından otomatik olarak oluşturma
type RegisterFormInputs = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter(); // Sayfa yönlendirmesi için hook
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // 3. react-hook-form'u başlatma
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormInputs>({
    resolver: zodResolver(registerSchema), // Zod'u doğrulama motoru olarak ayarla
  });

  // 4. Form gönderildiğinde çalışacak olan asenkron fonksiyon
  const onSubmit: SubmitHandler<RegisterFormInputs> = async (data) => {
    setError(null);
    setSuccess(null);
    
    try {
      // .env.local dosyasından API adresini al
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      // Backend'deki register endpoint'ine POST isteği gönder
      await axios.post(`${apiUrl}/api/Auth/register`, data);
      
      setSuccess('Kaydınız başarıyla oluşturuldu! Giriş sayfasına yönlendiriliyorsunuz...');
      
      // Başarılı kayıt sonrası 2 saniye bekleyip kullanıcıyı /login sayfasına yönlendir
      setTimeout(() => {
        router.push('/login');
      }, 2000);

    } catch (err: any) {
      // API'den bir hata dönerse, bu hatayı yakala ve ekranda göster
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data.message || 'Bir hata oluştu. Lütfen tekrar deneyin.');
      } else {
        setError('Beklenmedik bir hata oluştu. İnternet bağlantınızı kontrol edin.');
      }
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h5">
          Hesap Oluştur
        </Typography>
        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ mt: 3 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="name"
            label="İsim Soyisim"
            autoFocus
            {...register('name')} // react-hook-form ile alanı bağlıyoruz
            error={!!errors.name} // Hata varsa alanı kırmızı yap
            helperText={errors.name?.message} // Hata mesajını göster
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="E-posta Adresi"
            autoComplete="email"
            {...register('email')}
            error={!!errors.email}
            helperText={errors.email?.message}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Şifre"
            type="password"
            id="password"
            autoComplete="new-password"
            {...register('password')}
            error={!!errors.password}
            helperText={errors.password?.message}
          />

          {/* Hata veya başarı mesajlarını göstermek için Alert bileşenleri */}
          {error && <Alert severity="error" sx={{ mt: 2, width: '100%' }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mt: 2, width: '100%' }}>{success}</Alert>}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={isSubmitting} // İstek gönderilirken butonu pasif yap
          >
            {isSubmitting ? 'Kaydediliyor...' : 'Kayıt Ol'}
          </Button>

          <Box textAlign="center">
            <Link href="/login" variant="body2">
              Zaten bir hesabın var mı? Giriş Yap
            </Link>
          </Box>
        </Box>
      </Box>
    </Container>
  );
}
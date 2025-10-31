// Dosya: client/src/lib/apiClient.ts

import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

// Request Interceptor (İstek Kesici)
apiClient.interceptors.request.use(
  (config) => {//her istek gönderilmeden önce çalışıyo

    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;
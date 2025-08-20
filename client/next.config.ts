import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
 output: 'standalone',
  
  eslint: {
    // Bu ayar, build sırasında ESLint'in hata vermesini engeller
    ignoreDuringBuilds: true,
  },
}

export default nextConfig
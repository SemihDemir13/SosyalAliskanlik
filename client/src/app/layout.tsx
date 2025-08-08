// client/src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// --- YENİ EKLENENLER ---
import { AppRouterCacheProvider } from '@mui/material-nextjs/v13-appRouter';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';
// --- BİTTİ ---

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sosyal Alışkanlık Takipçisi",
  description: "Alışkanlıklarınızı takip edin ve motive olun!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* MUI için sarmalayıcıları ekliyoruz */}
        <AppRouterCacheProvider>
          <ThemeProvider theme={theme}>
            {children}
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
// Dosya: client/src/app/(app)/layout.tsx
'use client';

import Navbar from "@/components/Navbar";
import AuthGuard from "@/components/AuthGuard";
import { CssBaseline, Container, Box } from "@mui/material"; // Container ve Box'ı import et

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <Navbar />
      <main>
        {/* --- YENİ EKLENEN SARMALAYICI --- */}
        {/* Container, içeriği yatayda ortalar ve kenar boşlukları ekler. */}
        {/* Box ile de yukarıdan biraz boşluk vererek Navbar'a yapışmasını önleriz. */}
        <Container maxWidth="lg">
          <Box sx={{ mt: 4 }}> {/* mt: 4 -> margin-top: 32px */}
            {children}
          </Box>
        </Container>
      </main>
    </AuthGuard>
  );
}
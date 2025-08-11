// Dosya: client/src/app/(app)/layout.tsx
import Navbar from "@/components/Navbar";
import AuthGuard from "@/components/AuthGuard"; 
import { CssBaseline } from "@mui/material"; 

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <CssBaseline />
      <Navbar />
      <main>{children}</main>
    </AuthGuard>
  );
}
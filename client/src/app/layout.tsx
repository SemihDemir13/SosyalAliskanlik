// Dosya: client/src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import ThemeRegistry from "@/components/ThemeRegistry";

export const metadata: Metadata = { /* ... */ };

export default function RootLayout({ children }: { children: React.ReactNode; }) {
  return (
    <html lang="en">
      <body>
        {/* Sadece ThemeRegistry kalacak */}
        <ThemeRegistry>
          {children}
        </ThemeRegistry>
      </body>
    </html>
  );
}
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ThemeRegistry from "@/theme/ThemeRegistry"; 

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sosyal Alışkanlık App",
  description: "Alışkanlıklarınızı takip edin ve sosyalleşin.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
       
        <ThemeRegistry>
          {children}
        </ThemeRegistry>
      </body>
    </html>
  );
}
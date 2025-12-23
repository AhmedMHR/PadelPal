import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import HomeButton from "@/components/HomeButton"; 

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PadelPal",
  description: "Book. Play. Win.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <AuthProvider>
          {children}
          <HomeButton /> 
        </AuthProvider>
      </body>
    </html>
  );
}
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Provider } from "@/components/ui/provider";
import { Toaster } from "@/components/ui/toaster";
import { Sidebar } from "@/components/layout/sidebar";
import { Box } from "@chakra-ui/react";
import { LocaleProvider } from "@/hooks/use-locale";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Receitou",
  description: "Plataforma de prescrições médicas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Provider>
          <LocaleProvider>
            <Sidebar />
            <Box ml="240px" px="8" py="6" minH="100vh">
              {children}
            </Box>
            <Toaster />
          </LocaleProvider>
        </Provider>
      </body>
    </html>
  );
}
